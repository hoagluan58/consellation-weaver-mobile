using System;
using ConstellationWeaver.Data;
using NFramework;
using UnityEngine;

namespace ConstellationWeaver.Puzzle
{
    public class PuzzleController : MonoBehaviour
    {
        public const string STATE_IDLE = "IDLE";
        public const string STATE_DRAWING = "DRAWING";
        public const string STATE_VALIDATING = "VALIDATING";
        public const string STATE_SOLVED = "SOLVED";

        public event Action<Vector2Int> OnPathAppended;
        public event Action<Vector2Int> OnPathPopped;
        public event Action OnPathCleared;
        public event Action OnPuzzleSolved;

        private StateMachine _stateMachine;
        private GridModel _gridModel;
        private PathModel _pathModel;

        public PathModel Path => _pathModel;
        public GridModel Grid => _gridModel;
        public string CurrentStateId => _stateMachine?.CurrentState?.Id;

        public void Initialize(LevelData levelData)
        {
            _gridModel = new GridModel(levelData);
            _pathModel = new PathModel(_gridModel, levelData.width * levelData.height);


            _stateMachine = new StateMachine();
            _stateMachine.Init(STATE_IDLE,
                new StateBase(STATE_IDLE, _stateMachine),
                new StateBase(STATE_DRAWING, _stateMachine),
                new StateBase(STATE_VALIDATING, _stateMachine),
                new StateBase(STATE_SOLVED, _stateMachine)
            );
        }

        public void HandleTouchDown(Vector2Int gridCell)
        {
            if (CurrentStateId != STATE_IDLE) return;


            _pathModel.Clear();
            OnPathCleared?.Invoke();

            if (_pathModel.TryAppend(gridCell))
            {
                _stateMachine.ChangeState(STATE_DRAWING);
                OnPathAppended?.Invoke(gridCell);
            }
        }

        public void HandleTouchDrag(Vector2Int gridCell)
        {
            if (CurrentStateId != STATE_DRAWING) return;

            if (_pathModel.Path.Count > 0 && _pathModel.Path[_pathModel.Path.Count - 1] == gridCell)

                return; // Still in the same cell

            int previousCount = _pathModel.Path.Count;
            Vector2Int previousTail = previousCount > 0 ? _pathModel.Path[previousCount - 1] : Vector2Int.one * -1;

            if (_pathModel.TryAppend(gridCell))
            {
                if (_pathModel.Path.Count > previousCount)
                {
                    OnPathAppended?.Invoke(gridCell);
                }
                else if (_pathModel.Path.Count < previousCount)
                {
                    OnPathPopped?.Invoke(previousTail);
                }
            }
        }

        public void HandleTouchUp()
        {
            if (CurrentStateId != STATE_DRAWING) return;

            _stateMachine.ChangeState(STATE_VALIDATING);


            if (PuzzleValidator.IsPathValidSolution(_gridModel, _pathModel))
            {
                _stateMachine.ChangeState(STATE_SOLVED);
                OnPuzzleSolved?.Invoke();
            }
            else
            {
                _pathModel.Clear();
                OnPathCleared?.Invoke();
                _stateMachine.ChangeState(STATE_IDLE);
            }
        }

        /// <summary>
        /// Cancel the current puzzle without triggering solved events.
        /// Call this when the player navigates away mid-puzzle.
        /// </summary>
        public void AbortPuzzle()
        {
            if (_pathModel != null)
            {
                _pathModel.Clear();
                OnPathCleared?.Invoke();
            }
            _stateMachine?.ChangeState(STATE_IDLE);
        }
    }
}
