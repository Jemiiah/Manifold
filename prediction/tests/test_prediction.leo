// The 'test_prediction' test program.
import prediction.aleo;
program test_prediction.aleo {
    @test
    script test_it() {
        let result: u32 = prediction.aleo/main(1u32, 2u32);
        assert_eq(result, 3u32);
    }

    @test
    @should_fail
    transition do_nothing() {
        let result: u32 = prediction.aleo/main(2u32, 3u32);
        assert_eq(result, 3u32);
    }

    @noupgrade
    async constructor() {}
}
