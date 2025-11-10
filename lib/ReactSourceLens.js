import { useEffect } from "react";

// Utility to find the internal React fiber node with error handling
function getFiberFromNode(node) {
  try {
    // React stores fiber on DOM nodes with keys starting with __react
    const key = Object.keys(node).find(k =>
      k.startsWith('__reactFiber') ||
      k.startsWith('__reactInternalInstance')
    );


    if (key) {
      const fiber = node[key];
      return fiber;
    }

    // Fallback: search through all properties for React-like objects
    const allValues = Object.values(node);

    const fiberCandidate = allValues.find((v) =>
      v &&
      typeof v === 'object' &&
      v.hasOwnProperty &&
      v.hasOwnProperty('memoizedProps') &&
      v.hasOwnProperty('return') &&
      (v.hasOwnProperty('type') || v.hasOwnProperty('elementType'))
    );

    return fiberCandidate;
  } catch (error) {
    console.warn('[React Source Lens] Error accessing fiber node:', error);
    return null;
  }
}

function showErrorNotification(message) {
  try {
    const notification = document.createElement('div');
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: '#ef4444',
      color: 'white',
      borderRadius: '4px',
      padding: '8px 12px',
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      zIndex: 1000000,
      maxWidth: '300px',
      wordWrap: 'break-word'
    });

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  } catch (error) {
    console.warn('[React Source Lens] Error showing notification:', error);
  }
}

function createOverlay() {
  try {
    const div = document.createElement("div");
    Object.assign(div.style, {
      position: "fixed",
      border: "2px solid #4ade80",
      background: "rgba(74,222,128,0.2)",
      pointerEvents: "none",
      zIndex: 999999,
    });
    document.body.appendChild(div);
    return div;
  } catch (error) {
    console.warn('[React Source Lens] Error creating overlay:', error);
    return null;
  }
}

function createSourceModal(fileName, lineNumber, projectRoot, editor = 'vscode') {
  const existingModal = document.getElementById('react-source-lens-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Helper function to generate editor URLs
  function getEditorUrl(editor, fileName, lineNumber, projectRoot) {
    // Ensure we have an absolute path
    let absolutePath = fileName;
    if (!fileName.startsWith('/') && projectRoot) {
      absolutePath = `${projectRoot}/${fileName}`;
    }

    switch (editor.toLowerCase()) {
      case 'vscode':
      case 'code':
        return `vscode://file${absolutePath}:${lineNumber}`;
      case 'webstorm':
      case 'intellij':
        // WebStorm/IntelliJ IDEA format
        return `jetbrains://idea/navigate/reference?project=${projectRoot || 'project'}&path=${absolutePath}&line=${lineNumber}`;
      case 'atom':
        return `atom://core/open/file?file=${encodeURIComponent(absolutePath)}&line=${lineNumber}`;
      case 'sublime':
      case 'sublimetext':
        return `subl://open?url=file://${encodeURIComponent(absolutePath)}&line=${lineNumber}`;
      case 'cursor':
        return `cursor://file${absolutePath}:${lineNumber}`;
      case 'windsurf':
        return `windsurf://file${absolutePath}:${lineNumber}`;
      default:
        // Try VS Code as fallback
        console.warn(`[React Source Lens] Unknown editor "${editor}", falling back to VS Code`);
        return `vscode://file${absolutePath}:${lineNumber}`;
    }
  }

  // Extract a clean display path for the modal
  let displayPath = fileName;
  if (fileName.includes('/src/')) {
    // Extract from src/ onwards for cleaner display
    const parts = fileName.split('/src/');
    if (parts.length > 1) {
      displayPath = 'src/' + parts[parts.length - 1];
    }
  } else if (fileName.includes('/app/') || fileName.includes('/lib/') || fileName.includes('/components/')) {
    // Handle other common source directories
    const altDirs = ['/app/', '/lib/', '/source/', '/client/', '/components/'];
    for (const dir of altDirs) {
      if (fileName.includes(dir)) {
        const parts = fileName.split(dir);
        if (parts.length > 1) {
          displayPath = dir.slice(1, -1) + '/' + parts[parts.length - 1];
          break;
        }
      }
    }
  } else if (fileName.startsWith('/') && fileName.split('/').length > 3) {
    // For absolute paths, show last 2-3 path segments
    const parts = fileName.split('/');
    displayPath = parts.slice(-3).join('/');
  }

  const modal = document.createElement('div');
  modal.id = 'react-source-lens-modal';
  Object.assign(modal.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: 'white',
    border: '2px solid #4ade80',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 1000000,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '14px',
    maxWidth: '300px',
    cursor: 'default'
  });

  const title = document.createElement('h4');
  title.textContent = 'Component Source Found';
  title.style.margin = '0 0 12px 0';
  title.style.color = '#1f2937';

  const fileInfo = document.createElement('div');
  fileInfo.textContent = `${displayPath}:${lineNumber}`;
  fileInfo.style.fontFamily = 'monospace';
  fileInfo.style.background = '#f3f4f6';
  fileInfo.style.padding = '8px';
  fileInfo.style.borderRadius = '4px';
  fileInfo.style.marginBottom = '12px';
  fileInfo.style.wordBreak = 'break-all';
  fileInfo.style.color = '#1f2937'; // Explicit text color for visibility

  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '8px';

  // Open in Editor button
  const editorBtn = document.createElement('button');
  const editorName = editor.toLowerCase() === 'vscode' ? 'VS Code' :
    editor.toLowerCase() === 'webstorm' ? 'WebStorm' :
      editor.toLowerCase() === 'intellij' ? 'IntelliJ' :
        editor.toLowerCase() === 'cursor' ? 'Cursor' :
          editor.toLowerCase() === 'windsurf' ? 'Windsurf' :
            editor.charAt(0).toUpperCase() + editor.slice(1);
  editorBtn.textContent = `Open in ${editorName}`;
  Object.assign(editorBtn.style, {
    padding: '6px 12px',
    background: '#4ade80',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  });
  editorBtn.onclick = () => {
    try {
      const editorUrl = getEditorUrl(editor, fileName, lineNumber, projectRoot);
      window.open(editorUrl, '_blank');
    } catch (error) {
      console.warn('[React Source Lens] Error opening editor:', error);
      alert(`Could not open ${editorName}. Check console for details.`);
    }
    modal.remove();
  };

  // Copy to clipboard button
  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy Path';
  Object.assign(copyBtn.style, {
    padding: '6px 12px',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  });
  copyBtn.onclick = () => {
    try {
      navigator.clipboard.writeText(`${displayPath}:${lineNumber}`);
      copyBtn.textContent = 'Copied!';
      copyBtn.style.background = '#10b981';
      setTimeout(() => {
        copyBtn.textContent = 'Copy Path';
        copyBtn.style.background = '#6b7280';
      }, 2000);
    } catch (error) {
      console.warn('[React Source Lens] Error copying to clipboard:', error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = `${displayPath}:${lineNumber}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#10b981';
        setTimeout(() => {
          copyBtn.textContent = 'Copy Path';
          copyBtn.style.background = '#6b7280';
        }, 2000);
      } catch (fallbackError) {
        console.warn('[React Source Lens] Fallback copy failed:', fallbackError);
        alert(`Copy this path: ${displayPath}:${lineNumber}`);
      }
    }
  };

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  Object.assign(closeBtn.style, {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });
  closeBtn.onclick = () => modal.remove();

  buttonContainer.appendChild(editorBtn);
  buttonContainer.appendChild(copyBtn);

  modal.appendChild(closeBtn);
  modal.appendChild(title);
  modal.appendChild(fileInfo);
  modal.appendChild(buttonContainer);

  document.body.appendChild(modal);

  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (modal.parentNode) {
      modal.remove();
    }
  }, 10000);

  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

export function useReactSourceLens(options = {}) {
  const { projectRoot, editor: userEditor } = options;

  // Auto-detect editor if not specified
  const detectedEditor = userEditor || detectEditor();
  const editor = detectedEditor || 'vscode'; // fallback to vscode

  function detectEditor() {
    try {
      // Check environment variables
      const editorEnv = (typeof process !== 'undefined' && process.env)
        ? (process.env.REACT_EDITOR || process.env.EDITOR)
        : null;
      if (editorEnv) {
        const lowerEnv = editorEnv.toLowerCase();
        if (lowerEnv.includes('code') || lowerEnv.includes('vscode')) return 'vscode';
        if (lowerEnv.includes('webstorm') || lowerEnv.includes('idea')) return 'webstorm';
        if (lowerEnv.includes('atom')) return 'atom';
        if (lowerEnv.includes('sublime')) return 'sublime';
        if (lowerEnv.includes('cursor')) return 'cursor';
        if (lowerEnv.includes('windsurf')) return 'windsurf';
      }

      // Check for running processes (if available)
      // This is a simple heuristic - check common editor process names
      if (typeof window !== 'undefined' && window.navigator) {
        // Could add more sophisticated detection here in the future
        // For now, rely on environment variables
      }

      return null;
    } catch (error) {
      console.warn('[React Source Lens] Error detecting editor:', error);
      return null;
    }
  }
  useEffect(() => {
    let overlay = null;
    try {
      overlay = createOverlay();
      if (!overlay) {
        console.warn('[React Source Lens] Failed to create overlay, tool will not function');
        return;
      }
    } catch (error) {
      console.warn('[React Source Lens] Error initializing overlay:', error);
      return;
    }

    let lastHovered = null;
    let isEnabled = true; // Toggle state for the overlay

    // Update overlay visibility
    const updateOverlayVisibility = () => {
      try {
        if (overlay) {
          overlay.style.display = isEnabled ? 'block' : 'none';
        }
      } catch (error) {
        console.warn('[React Source Lens] Error updating overlay visibility:', error);
      }
    };

    updateOverlayVisibility(); // Initial state

    const moveHandler = (e) => {
      if (!isEnabled) return; // Skip if disabled

      try {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || !overlay) return;
        if (el !== lastHovered) {
          lastHovered = el;
          const rect = el.getBoundingClientRect();
          overlay.style.left = rect.left + "px";
          overlay.style.top = rect.top + "px";
          overlay.style.width = rect.width + "px";
          overlay.style.height = rect.height + "px";
        }
      } catch (error) {
        console.warn('[React Source Lens] Error in move handler:', error);
      }
    };

    const keyHandler = (e) => {
      try {
        // Toggle overlay with Cmd+Shift+L
        if (e.metaKey && e.shiftKey && e.code === "KeyL") {
          isEnabled = !isEnabled;
          updateOverlayVisibility();
          return;
        }

        // Only proceed with source inspection if enabled
        if (!isEnabled) return;

        if (e.metaKey && e.shiftKey && e.code === "KeyO") {
          if (!lastHovered) return;

          try {
            const sourceFile = lastHovered.getAttribute('data-source-file');
            const sourceLine = lastHovered.getAttribute('data-source-line');

            if (sourceFile && sourceLine) {
              createSourceModal(sourceFile, sourceLine, projectRoot, editor);
              return;
            }

            let current = lastHovered;
            let depth = 0;
            while (current && depth < 10) {
              if (current.hasAttribute && current.hasAttribute('data-reactroot')) {
                break;
              }
              current = current.parentElement;
              depth++;
            }

            const fiber = getFiberFromNode(lastHovered);

            if (!fiber) {
              showErrorNotification("Could not find React fiber node for this element");
              return;
            }

            let pointer = fiber;
            let steps = 0;
            while (pointer && steps < 20) {

              if (pointer._debugSource) {
                const src = pointer._debugSource;
                createSourceModal(src.fileName, src.lineNumber, projectRoot, editor);
                return;
              }

              // Check owner fiber if available
              if (pointer._owner && pointer._owner._debugSource) {
                const src = pointer._owner._debugSource;
                createSourceModal(src.fileName, src.lineNumber, projectRoot, editor);
                return;
              }

              // Check props.__source as fallback
              const props = pointer.memoizedProps || pointer.pendingProps;
              if (props && props.__source) {
                const src = props.__source;
                createSourceModal(src.fileName, src.lineNumber, projectRoot, editor);
                return;
              }

              // Try both return and _owner for traversal
              pointer = pointer.return || pointer._owner;
              steps++;
            }
            showErrorNotification("No source info found for this element");
          } catch (innerError) {
            console.warn('[React Source Lens] Error during source inspection:', innerError);
            showErrorNotification("An error occurred while inspecting this element");
          }
        }
      } catch (error) {
        console.warn('[React Source Lens] Error in key handler:', error);
      }
    };

    try {
      document.addEventListener("mousemove", moveHandler);
      document.addEventListener("keydown", keyHandler);
    } catch (error) {
      console.warn('[React Source Lens] Error adding event listeners:', error);
      return;
    }

    return () => {
      try {
        document.removeEventListener("mousemove", moveHandler);
        document.removeEventListener("keydown", keyHandler);
        if (overlay && overlay.parentNode) {
          overlay.remove();
        }
      } catch (error) {
        console.warn('[React Source Lens] Error cleaning up:', error);
      }
    };
  }, []);
}
