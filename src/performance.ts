declare const global: any;
let perf = null;
const start = Date.now();

if (!global) {
    perf = window.performance;
} else {
    perf = {
        now() {
            return Date.now() - start;
        },
    };
}

export default perf;
