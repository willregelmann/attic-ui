/**
 * DOM Patch for Google Sign-In and other third-party DOM manipulation
 * 
 * This patch prevents React from crashing when third-party libraries
 * (like Google Sign-In SDK) manipulate the DOM outside of React's control.
 * 
 * The issue occurs when React tries to remove DOM nodes that have been
 * moved or modified by external scripts.
 */

export function applyDOMPatch() {
  if (typeof window !== 'undefined' && !window.__domPatchApplied) {
    // Patch removeChild to handle missing nodes gracefully
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function (child) {
      try {
        return originalRemoveChild.call(this, child);
      } catch (error) {
        if (error.name === 'NotFoundError' || 
            error.message.includes('The node to be removed is not a child of this node')) {
          console.warn('DOM patch: Attempted to remove non-child node, ignoring error');
          return child;
        }
        throw error;
      }
    };
    
    // Patch insertBefore to handle missing reference nodes
    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function (newNode, referenceNode) {
      try {
        return originalInsertBefore.call(this, newNode, referenceNode);
      } catch (error) {
        if (error.name === 'NotFoundError' || 
            error.message.includes('The node before which the new node is to be inserted is not a child of this node')) {
          console.warn('DOM patch: Insert before failed, appending instead');
          return this.appendChild(newNode);
        }
        throw error;
      }
    };
    
    // Patch replaceChild to handle missing nodes
    const originalReplaceChild = Node.prototype.replaceChild;
    Node.prototype.replaceChild = function (newChild, oldChild) {
      try {
        return originalReplaceChild.call(this, newChild, oldChild);
      } catch (error) {
        if (error.name === 'NotFoundError' || 
            error.message.includes('The node to be replaced is not a child of this node')) {
          console.warn('DOM patch: Replace child failed, appending instead');
          return this.appendChild(newChild);
        }
        throw error;
      }
    };
    
    window.__domPatchApplied = true;
    console.log('DOM patch applied successfully');
  }
}

// Auto-apply patch when module is imported
applyDOMPatch();