#include "pros/apix.h"
#include "utest.h"

UTEST(foo, bar) {
    std::cout << pros::millis() << std::endl;
    std::cout << vexSystemTimeGet() << std::endl;
    pros::delay(1000);
    std::cout << pros::millis() << std::endl;
    std::cout << vexSystemTimeGet() << std::endl;

    ASSERT_TRUE(1);
}

UTEST(foo, bar2) {
    std::cout << pros::millis() << std::endl;
    std::cout << vexSystemTimeGet() << std::endl;
    pros::delay(1000);
    std::cout << pros::millis() << std::endl;
    std::cout << vexSystemTimeGet() << std::endl;

    ASSERT_TRUE(1);
}