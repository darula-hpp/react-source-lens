import { useEffect } from "react";

// Utility to find the internal React fiber node
function getFiberFromNode(node) {
  console.log("[React Source Lens] Looking for fiber on element:", node);
  
  // Log all React-related keys
  const reactKeys = Object.keys(node).filter(k => k.includes('react') || k.startsWith('__'));
  console.log("[React Source Lens] React-related keys:", reactKeys);
  
  // Show values of React keys
  reactKeys.forEach(key => {
    console.log(`[React Source Lens] ${key}:`, node[key]);
  });
  
  // React stores fiber on DOM nodes with keys starting with __react
  const key = Object.keys(node).find(k => 
    k.startsWith('__reactFiber') || 
    k.startsWith('__reactInternalInstance')
  );
  
  console.log("[React Source Lens] Found React key:", key);
  
  if (key) {
    const fiber = node[key];
    console.log("[React Source Lens] Fiber from key:", fiber);
    return fiber;
  }
  
  // Fallback: search through all properties for React-like objects
  const allValues = Object.values(node);
  console.log("[React Source Lens] Checking all values:", allValues.length);
  
  const fiberCandidate = allValues.find((v) => 
    v && 
    typeof v === 'object' && 
    v.hasOwnProperty('memoizedProps') && 
    v.hasOwnProperty('return') &&
    (v.hasOwnProperty('type') || v.hasOwnProperty('elementType'))
  );
  
  console.log("[React Source Lens] Fiber candidate:", fiberCandidate);
  return fiberCandidate;
}

function showErrorNotification(message) {
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
}

function createOverlay() {
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
}

function createSourceModal(fileName, lineNumber, projectRoot) {
  console.log('[React Source Lens] createSourceModal called with:', { fileName, lineNumber, projectRoot });
  const existingModal = document.getElementById('react-source-lens-modal');
  if (existingModal) {
    existingModal.remove();
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
  fileInfo.textContent = `${fileName}:${lineNumber}`;
  fileInfo.style.fontFamily = 'monospace';
  fileInfo.style.background = '#f3f4f6';
  fileInfo.style.padding = '8px';
  fileInfo.style.borderRadius = '4px';
  fileInfo.style.marginBottom = '12px';
  fileInfo.style.wordBreak = 'break-all';

  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '8px';

  // Open in VS Code button
  const vscodeBtn = document.createElement('button');
  vscodeBtn.textContent = 'Open in VS Code';
  Object.assign(vscodeBtn.style, {
    padding: '6px 12px',
    background: '#4ade80',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  });
  vscodeBtn.onclick = () => {
    console.log('[React Source Lens] VS Code button clicked');
    console.log('[React Source Lens] Inputs:', { fileName, lineNumber, projectRoot });

    let vscodeUrl;

    if (projectRoot) {
      // Use the configured project root
      const fullPath = fileName.startsWith('/') ? fileName : `${projectRoot}/${fileName}`;
      vscodeUrl = `vscode://file${fullPath}:${lineNumber}`;
      console.log('[React Source Lens] Constructed path:', { fullPath, vscodeUrl });
    } else {
      // Fallback: try to guess the path
      console.warn('[React Source Lens] No projectRoot configured. VS Code integration may not work properly.');
      console.warn('[React Source Lens] To fix this, pass projectRoot to useReactSourceLens:');
      console.warn('[React Source Lens] useReactSourceLens({ projectRoot: "/path/to/your/project" })');

      if (fileName.startsWith('/')) {
        vscodeUrl = `vscode://file${fileName}:${lineNumber}`;
      } else {
        // For demo purposes, try common paths
        vscodeUrl = `vscode://file/${fileName}:${lineNumber}`;
        alert(`VS Code integration needs configuration!\n\nAdd this to your app:\nuseReactSourceLens({ projectRoot: "/path/to/your/project" })\n\nTrying to open: ${fileName}:${lineNumber}`);
      }
    }

    console.log('[React Source Lens] Final VS Code URL:', vscodeUrl);
    console.log('[React Source Lens] Opening URL...');
    window.open(vscodeUrl, '_blank');
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
    navigator.clipboard.writeText(`${fileName}:${lineNumber}`);
    copyBtn.textContent = 'Copied!';
    copyBtn.style.background = '#10b981';
    setTimeout(() => {
      copyBtn.textContent = 'Copy Path';
      copyBtn.style.background = '#6b7280';
    }, 2000);
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

  buttonContainer.appendChild(vscodeBtn);
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
  const { projectRoot } = options;
  useEffect(() => {
    const overlay = createOverlay();
    let lastHovered = null;
    let isEnabled = true; // Toggle state for the overlay

    // Update overlay visibility
    const updateOverlayVisibility = () => {
      overlay.style.display = isEnabled ? 'block' : 'none';
    };

    updateOverlayVisibility(); // Initial state

    const moveHandler = (e) => {
      if (!isEnabled) return; // Skip if disabled

      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;
      if (el !== lastHovered) {
        lastHovered = el;
        const rect = el.getBoundingClientRect();
        overlay.style.left = rect.left + "px";
        overlay.style.top = rect.top + "px";
        overlay.style.width = rect.width + "px";
        overlay.style.height = rect.height + "px";
      }
    };

    const keyHandler = (e) => {
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
        
        // Method 1: Check for our custom data attributes
        const sourceFile = lastHovered.getAttribute('data-source-file');
        const sourceLine = lastHovered.getAttribute('data-source-line');
        
        if (sourceFile && sourceLine) {
          const message = `${sourceFile}:${sourceLine}`;
          console.log("[React Source Lens] Found via data attributes:", message);
          createSourceModal(sourceFile, sourceLine, projectRoot);
          return;
        }
      
        
        // Rest of the existing logic...
        
        // Method 2: Check if element has any data attributes we can use
        const allAttributes = lastHovered.attributes;
        if (allAttributes) {
          console.log("[React Source Lens] Element attributes:");
          for (let i = 0; i < allAttributes.length; i++) {
            const attr = allAttributes[i];
            console.log(`  ${attr.name}: ${attr.value}`);
          }
        }
        
        // Method 3: Try to find component by walking up the DOM and checking for data-reactroot or similar
        let current = lastHovered;
        let depth = 0;
        while (current && depth < 10) {
          console.log(`[React Source Lens] DOM level ${depth}:`, current.tagName, current.id, current.className);
          if (current.hasAttribute && current.hasAttribute('data-reactroot')) {
            console.log("[React Source Lens] Found React root!");
            break;
          }
          current = current.parentElement;
          depth++;
        }
        
        // Method 4: Try to access React internals differently
        console.log("[React Source Lens] Element:", lastHovered);
        console.log("[React Source Lens] Element keys:", Object.keys(lastHovered));
        
        // Look for any property that might contain React info
        const reactLikeProps = Object.keys(lastHovered).filter(key => 
          key.toLowerCase().includes('react') || 
          key.startsWith('_') ||
          key.startsWith('__')
        );
        console.log("[React Source Lens] React-like properties:", reactLikeProps);
        
        reactLikeProps.forEach(prop => {
          console.log(`[React Source Lens] ${prop}:`, lastHovered[prop]);
        });
        
        const fiber = getFiberFromNode(lastHovered);
        console.log("[React Source Lens] Fiber result:", fiber);
        
        if (!fiber) {
          showErrorNotification("Could not find React fiber node for this element");
          return;
        }
        
        let pointer = fiber;
        let steps = 0;
        while (pointer && steps < 20) {
          console.log(`[React Source Lens] Step ${steps}:`, {
            type: pointer.type,
            elementType: pointer.elementType,
            _debugSource: pointer._debugSource,
            memoizedProps: pointer.memoizedProps,
            owner: pointer._owner,
            return: pointer.return
          });
          
          // Check _debugSource first (React's debug info)
          if (pointer._debugSource) {
            const src = pointer._debugSource;
            const message = `${src.fileName}:${src.lineNumber}`;
            console.log("[React Source Lens] Found via _debugSource:", message);
            createSourceModal(src.fileName, src.lineNumber, projectRoot);
            return;
          }
          
          // Check owner fiber if available
          if (pointer._owner && pointer._owner._debugSource) {
            const src = pointer._owner._debugSource;
            const message = `${src.fileName}:${src.lineNumber}`;
            console.log("[React Source Lens] Found via owner._debugSource:", message);
            createSourceModal(src.fileName, src.lineNumber, projectRoot);
            return;
          }
          
          // Check props.__source as fallback
          const props = pointer.memoizedProps || pointer.pendingProps;
          if (props?.__source) {
            const src = props.__source;
            const message = `${src.fileName}:${src.lineNumber}`;
            console.log("[React Source Lens] Found via props.__source:", message);
            createSourceModal(src.fileName, src.lineNumber, projectRoot);
            return;
          }
          
          // Try both return and _owner for traversal
          pointer = pointer.return || pointer._owner;
          steps++;
        }
        showErrorNotification("No source info found for this element");
      }
    };

    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousemove", moveHandler);
      document.removeEventListener("keydown", keyHandler);
      overlay.remove();
    };
  }, []);
}
