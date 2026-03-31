"""
Heuristic difficulty scorer for a package (1=beginner, 2=intermediate, 3=advanced).
"""


def compute_difficulty(
    num_exports: int,
    num_dependencies: int,
    readme_length: int,
    has_async: bool,
    has_typing: bool,
) -> int:
    score = 0

    # Size of public API
    if num_exports > 30:
        score += 2
    elif num_exports > 10:
        score += 1

    # Dependency count
    if num_dependencies > 10:
        score += 2
    elif num_dependencies > 4:
        score += 1

    # README complexity
    if readme_length > 8000:
        score += 1

    # Advanced language features
    if has_async:
        score += 1
    if has_typing:
        score += 1

    if score <= 1:
        return 1
    if score <= 3:
        return 2
    return 3
