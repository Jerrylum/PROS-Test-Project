// // #include "main.h"

#include "pros/apix.h"
#include "utest.h"

UTEST_STATE();

extern "C" {

void vexSystemExitRequest(void);
}

void test_initialize() {
    pros::c::serctl(SERCTL_DISABLE_COBS, nullptr);
    printf("Running ' \" tests\n"); // test escape
    utest_main(0, nullptr);
    pros::delay(100); // wait for the console to print
    vexSystemExitRequest();
}
