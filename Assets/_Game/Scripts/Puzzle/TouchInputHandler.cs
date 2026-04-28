using UnityEngine;
using UnityEngine.InputSystem;

namespace ConstellationWeaver.Puzzle
{
    public class TouchInputHandler : MonoBehaviour
    {
        [SerializeField] private PuzzleController _controller;
        [SerializeField] private PuzzleRenderer _renderer;

        private void Update()
        {
            if (_controller == null || _renderer == null || Pointer.current == null) return;

            var pointer = Pointer.current;
            Vector2 screenPos = pointer.position.ReadValue();

            if (pointer.press.wasPressedThisFrame)
            {
                if (_renderer.TryGetGridCellAtScreenPosition(screenPos, out Vector2Int gridCell))
                {
                    _controller.HandleTouchDown(gridCell);
                }
            }
            else if (pointer.press.isPressed)
            {
                // Snap path to grid cells
                if (_renderer.TryGetGridCellAtScreenPosition(screenPos, out Vector2Int gridCell))
                {
                    _controller.HandleTouchDrag(gridCell);
                }

                // Update the live preview segment to follow the raw finger position
                _renderer.UpdateFingerPreview(_renderer.ScreenToWorld(screenPos));
            }
            else if (pointer.press.wasReleasedThisFrame)
            {
                _renderer.ClearFingerPreview();
                _controller.HandleTouchUp();
            }
        }
    }
}
