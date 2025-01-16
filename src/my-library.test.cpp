#include "pros/apix.h"
#include "utest.h"

UTEST(foo, bar) {
    pros::delay(1000);

    ASSERT_TRUE(1);
}

UTEST(foo, bar2) {
    pros::delay(300);

    ASSERT_TRUE(0);
}