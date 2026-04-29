import { describe, it, expect } from "bun:test";
import { logger } from "../src/application/logger.js";

describe("Logger", () => {
    it("should be defined", () => {
        expect(logger).toBeDefined();
    });

    it("should have expected logging methods", () => {
        expect(typeof logger.info).toBe("function");
        expect(typeof logger.error).toBe("function");
        expect(typeof logger.warn).toBe("function");
        expect(typeof logger.debug).toBe("function");
    });

    it("should log info without crashing", () => {
        expect(() => {
            logger.info("Test info message");
        }).not.toThrow();
    });

    it("should log error with metadata without crashing", () => {
        expect(() => {
            logger.error("Test error message", {
                path: "/api/test",
                method: "GET",
                stack: new Error().stack
            });
        }).not.toThrow();
    });

    it("should log objects without crashing", () => {
        expect(() => {
            logger.debug("Test debug object", { user: { id: 1, name: "Test" } });
        }).not.toThrow();
    });
});
