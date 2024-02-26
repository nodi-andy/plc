#ifndef ENUMS_H  // If ENUMS_H is not defined
#define ENUMS_H  // Define ENUMS_H

#include <array>
#include <string>
#include <vector>
#include <cmath>

using namespace std;
#define DEVICE_NAME "esp32mcu" // nodi.box , esp32mcu

class NodiEnums
{
public:
    enum Direction
    {
        UP = 1,
        DOWN = 2,
        LEFT = 3,
        RIGHT = 4,
        CENTER = 5
    };

    struct Vector2
    {
        int x, y;
    };

    static constexpr array<Vector2, 4> dirToVec = {{{1, 0}, {0, 1}, {-1, 0}, {0, -1}}};
    static constexpr array<int, 4> dirToAng = {0, 90, 180, 270};
    static constexpr array<double, 4> dirToRad = {0, M_PI / 2, M_PI, M_PI * 3 / 2};

    static constexpr array<Vector2, 9> allVec = {{{0, 0}, {1, 0}, {1, -1}, {0, -1}, {-1, -1}, {-1, 0}, {-1, 1}, {0, 1}, {1, 1}}};
    static constexpr array<Vector2, 8> nbVec = {{{1, 0}, {1, -1}, {0, -1}, {-1, -1}, {-1, 0}, {-1, 1}, {0, 1}, {1, 1}}};
};

#endif // ENUMS_H