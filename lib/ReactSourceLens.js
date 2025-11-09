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

export function useReactSourceLens() {
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
          alert(message);
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
          alert("Could not find React fiber node for this element");
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
            alert(message);
            return;
          }
          
          // Check owner fiber if available
          if (pointer._owner && pointer._owner._debugSource) {
            const src = pointer._owner._debugSource;
            const message = `${src.fileName}:${src.lineNumber}`;
            console.log("[React Source Lens] Found via owner._debugSource:", message);
            alert(message);
            return;
          }
          
          // Check props.__source as fallback
          const props = pointer.memoizedProps || pointer.pendingProps;
          if (props?.__source) {
            const src = props.__source;
            const message = `${src.fileName}:${src.lineNumber}`;
            console.log("[React Source Lens] Found via props.__source:", message);
            alert(message);
            return;
          }
          
          // Try both return and _owner for traversal
          pointer = pointer.return || pointer._owner;
          steps++;
        }
        alert("No source info found for this element");
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
