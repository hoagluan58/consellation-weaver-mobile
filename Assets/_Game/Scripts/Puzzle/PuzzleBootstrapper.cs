using UnityEngine;
using ConstellationWeaver.Core;

namespace ConstellationWeaver.Puzzle
{
    public class PuzzleBootstrapper : MonoBehaviour
    {
        [SerializeField] private PuzzleController _controller;
        [SerializeField] private PuzzleRenderer _renderer;
        [SerializeField] private string _testLevelId = "001_triangulum";

        private void Start()
        {
            var levelData = LevelLoader.LoadLevel(_testLevelId);
            if (levelData != null)
            {
                _controller.Initialize(levelData);
                _renderer.RenderLevel(_controller.Grid);
            }
        }
    }
}
