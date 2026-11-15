import sys
from pathlib import Path

# Permite `import altaris` ejecutando pytest desde pipeline/ o desde la raíz del repo.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
