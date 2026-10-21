import {expect, it, describe, vi, beforeEach, afterEach} from 'vitest';
import { 
    groupBy, 
    updateItemById, 
    deepPick, 
    debounce, 
    unique, 
    sortBy, 
    partition, 
    omit,
    getOrDefault,
    sleep,
    retry,
    countBy
 } from './exercises';
import type {Task} from '../features/tasks/model';

describe("Testing the Group By", () => {

    it("Group items by the key function - type 1 (arrays)", () => {
        expect(groupBy([3,42,123,12,41,89], (num) => (num%2 === 0? "Even" : "Odd")))
        .toEqual(
            {
                "Odd": [3, 123, 41, 89],
                "Even": [42, 12] 
            })
    });


    it("returns a empty object for a empty list", () => {
        expect(groupBy([], () => "test")).toEqual({});
    });

    it("does not mutate the input", () => {
        const input = [1, 2, 3];
        groupBy([1, 2, 3], () => "test");
        expect(input).toEqual([1, 2, 3]);
    });
});



describe("Testing updateItemById", () => {
    
    const tasks: Task[] = [
        {
            id: 1,
            name: "Task 1",
            status: "todo",
            priority: "high",
            createdAt: new Date()
        },
        {
            id: 2,
            name: "Task 2",
            status: "todo",
            priority: "high",
            createdAt: new Date()
        },
        {
            id: 3,
            name: "Task 3",
            status: "todo",
            priority: "high",
            createdAt: new Date()
        }
    ]

    it("Updates the Matching Item", () => {
        const result = updateItemById(tasks, 1, {status: "in_progress"});
        expect(result[0]).toEqual({...tasks[0], status: "in_progress"});
    })

    it("Leaves other items unchanged", () => {
        const result = updateItemById(tasks, 1, {status: "in_progress"});
        expect(result[1]).toEqual(tasks[1]);
    })

    it("it changes nothing when id doesn't exist", () => {
        const result = updateItemById(tasks, 98, {status: "in_progress"});
        expect(result).toEqual(tasks);
    })

    it("it doesn't mutate the original array of items", () => {
        const initInput = structuredClone(tasks);
        const result = updateItemById(tasks, 1, {status: "in_progress"});
        expect(tasks).toEqual(initInput);
        expect(result).not.toEqual(tasks);
        expect(result[0]).not.toEqual(tasks[0]);
    })
})


describe("deepPick", () => {
    const user = {
        name: "Vishnu",
        score: 0,
        active: false,
        profile: { address: { city: "Chennai" }, nickname: null },
    };

    it("finds a nested value", () => {
        expect(deepPick(user, "profile.address.city")).toBe("Chennai");
    });

    it("finds a top-level value", () => {
        expect(deepPick(user, "name")).toBe("Vishnu");
    });

    it("returns undefined for a missing path", () => {
        expect(deepPick(user, "profile.phone.number")).toBeUndefined();
    });

    it("returns undefined when the path goes through null", () => {
        expect(deepPick(user, "profile.nickname.first")).toBeUndefined();
    });

    it("returns falsy values correctly", () => {
        expect(deepPick(user, "score")).toBe(0);
        expect(deepPick(user, "active")).toBe(false);
    });

    it("does not mutate the input", () => {
        const before = structuredClone(user);
        deepPick(user, "profile.address.city");
        expect(user).toEqual(before);
    });
});


describe("debounce", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("does not call fn immediately", () => {
        const fn = vi.fn();
        debounce(fn, 100)();
        expect(fn).not.toHaveBeenCalled();
    });

    it("calls fn once after the delay", () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        debounced();
        vi.advanceTimersByTime(100);

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("collapses rapid calls into one", () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        debounced();
        vi.advanceTimersByTime(50);
        debounced();
        vi.advanceTimersByTime(50);
        debounced();
        vi.advanceTimersByTime(100);

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("restarts the timer on each call", () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        debounced();
        vi.advanceTimersByTime(50);
        debounced();                      
        vi.advanceTimersByTime(50);        
        expect(fn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(50);     
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("passes arguments to fn", () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        debounced("a", 1);
        vi.advanceTimersByTime(100);

        expect(fn).toHaveBeenCalledWith("a", 1);
    });
});




describe("unique", () => {
    it("removes duplicate numbers", () => {
        expect(unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
    });

    it("keeps the order of first occurrences", () => {
        expect(unique([3, 1, 3, 2, 1])).toEqual([3, 1, 2]);
    });

    it("works with strings", () => {
        expect(unique(["a", "b", "a"])).toEqual(["a", "b"]);
    });

    it("returns an empty array for an empty array", () => {
        expect(unique([])).toEqual([]);
    });

    it("treats equal looking objects as different", () => {
        const result = unique([{ id: 1 }, { id: 1 }]);
        expect(result).toHaveLength(2);
    });

    it("does not mutate the input", () => {
        const input = [1, 1, 2];
        const before = structuredClone(input);

        const result = unique(input);

        expect(input).toEqual(before);
        expect(result).not.toBe(input);
    });
});



describe("sortBy", () => {
    const people = [
        { name: "Vishnu", age: 40 },
        { name: "Vignesh", age: 25 },
        { name: "Kannan", age: 31 },
    ];

    it("sorts by a number key", () => {
        const result = sortBy(people, (p) => p.age);
        expect(result.map((p) => p.name)).toEqual(["Vignesh", "Kannan", "Vishnu"]);
    });

    it("sorts by a string key", () => {
        const result = sortBy(people, (p) => p.name);
        expect(result.map((p) => p.age)).toEqual([31, 25, 40]);
    });

    it("sorts numbers numerically, not as text", () => {
        expect(sortBy([10, 2, 33, 4], (n) => n)).toEqual([2, 4, 10, 33]);
    });

    it("keeps the original order for equal keys", () => {
        const items = [
            { id: 1, group: "a" },
            { id: 2, group: "a" },
            { id: 3, group: "a" },
        ];
        const result = sortBy(items, (i) => i.group);
        expect(result.map((i) => i.id)).toEqual([1, 2, 3]);
    });

    it("returns an empty array for an empty array", () => {
        expect(sortBy([], () => 0)).toEqual([]);
    });

    it("does not mutate the input", () => {
        const before = structuredClone(people);

        const result = sortBy(people, (p) => p.age);

        expect(people).toEqual(before);
        expect(result).not.toBe(people);
    });
});



describe("partition", () => {
    it("splits items into matching and non matching", () => {
        const [evens, odds] = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0);
        expect(evens).toEqual([2, 4]);
        expect(odds).toEqual([1, 3, 5]);
    });

    it("keeps the original order in both groups", () => {
        const [big, small] = partition([5, 1, 4, 2, 3], (n) => n >= 3);
        expect(big).toEqual([5, 4, 3]);
        expect(small).toEqual([1, 2]);
    });

    it("puts everything in the first group when all match", () => {
        expect(partition([1, 2, 3], () => true)).toEqual([[1, 2, 3], []]);
    });

    it("puts everything in the second group when none match", () => {
        expect(partition([1, 2, 3], () => false)).toEqual([[], [1, 2, 3]]);
    });

    it("returns two empty arrays for an empty input", () => {
        expect(partition([], () => true)).toEqual([[], []]);
    });

    it("works with objects", () => {
        const tasks = [
            { id: 1, done: true },
            { id: 2, done: false },
        ];
        const [done, pending] = partition(tasks, (t) => t.done);
        expect(done).toEqual([{ id: 1, done: true }]);
        expect(pending).toEqual([{ id: 2, done: false }]);
    });

    it("does not mutate the input", () => {
        const input = [1, 2, 3, 4];
        const before = structuredClone(input);

        partition(input, (n) => n > 2);

        expect(input).toEqual(before);
    });
});




describe("omit", () => {
    const user = { id: 1, name: "Vishnu", password: "secret" };

    it("removes the given key", () => {
        expect(omit(user, ["password"])).toEqual({ id: 1, name: "Vishnu" });
    });

    it("removes several keys", () => {
        expect(omit(user, ["id", "password"])).toEqual({ name: "Vishnu" });
    });

    it("returns an equal copy when no keys are given", () => {
        const result = omit(user, []);
        expect(result).toEqual(user);
        expect(result).not.toBe(user);
    });

    it("ignores a key that is already missing at runtime", () => {
        const partial: { id: number; name?: string } = { id: 1 };
        expect(omit(partial, ["name"])).toEqual({ id: 1 });
    });

    it("keeps falsy values on the other keys", () => {
        const data = { count: 0, label: "", flag: false, extra: 1 };
        expect(omit(data, ["extra"])).toEqual({ count: 0, label: "", flag: false });
    });

    it("does not mutate the input", () => {
        const before = structuredClone(user);

        omit(user, ["password"]);

        expect(user).toEqual(before);
    });
});



describe("getOrDefault", () => {
    it("returns the fallback for null", () => {
        expect(getOrDefault(null, 5)).toBe(5);
    });

    it("returns the fallback for undefined", () => {
        expect(getOrDefault(undefined, "default")).toBe("default");
    });

    it("returns the value when it is present", () => {
        expect(getOrDefault(10, 5)).toBe(10);
    });

    it("keeps 0", () => {
        expect(getOrDefault(0, 5)).toBe(0);
    });

    it("keeps an empty string", () => {
        expect(getOrDefault("", "hi")).toBe("");
    });

    it("keeps false", () => {
        expect(getOrDefault(false, true)).toBe(false);
    });

    it("keeps NaN", () => {
        expect(getOrDefault(NaN, 1)).toBeNaN();
    });
});



describe("sleep", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns a promise", () => {
        expect(sleep(10)).toBeInstanceOf(Promise);
    });

    it("does not resolve before the delay", async () => {
        const done = vi.fn();
        void sleep(100).then(done);

        await vi.advanceTimersByTimeAsync(99);

        expect(done).not.toHaveBeenCalled();
    });

    it("resolves once the delay has passed", async () => {
        const done = vi.fn();
        void sleep(100).then(done);

        await vi.advanceTimersByTimeAsync(100);

        expect(done).toHaveBeenCalledTimes(1);
    });

    it("resolves with undefined", async () => {
        const promise = sleep(50);
        await vi.advanceTimersByTimeAsync(50);

        await expect(promise).resolves.toBeUndefined();
    });
});


describe("retry", () => {
    it("returns the result when the first attempt succeeds", async () => {
        const fn = vi.fn().mockResolvedValue("ok");

        await expect(retry(fn, 3)).resolves.toBe("ok");
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("retries after a failure and then succeeds", async () => {
        const fn = vi
            .fn()
            .mockRejectedValueOnce(new Error("fail 1"))
            .mockRejectedValueOnce(new Error("fail 2"))
            .mockResolvedValue("ok");

        await expect(retry(fn, 3)).resolves.toBe("ok");
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it("throws the last error after running out of attempts", async () => {
        const fn = vi
            .fn()
            .mockRejectedValueOnce(new Error("first"))
            .mockRejectedValueOnce(new Error("second"))
            .mockRejectedValueOnce(new Error("third"));

        await expect(retry(fn, 3)).rejects.toThrow("third");
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it("does not retry when attempts is 1", async () => {
        const fn = vi.fn().mockRejectedValue(new Error("nope"));

        await expect(retry(fn, 1)).rejects.toThrow("nope");
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("rejects when attempts is less than 1", async () => {
        const fn = vi.fn().mockResolvedValue("ok");

        await expect(retry(fn, 0)).rejects.toThrow("at least 1");
        expect(fn).not.toHaveBeenCalled();
    });
});


describe("countBy", () => {
    it("counts items per key", () => {
        expect(countBy(["a", "b", "a", "c", "a"], (s) => s)).toEqual({
            a: 3,
            b: 1,
            c: 1,
        });
    });

    it("counts by a derived key", () => {
        const result = countBy([1, 2, 3, 4, 5], (n) =>
            n % 2 === 0 ? "even" : "odd"
        );
        expect(result).toEqual({ odd: 3, even: 2 });
    });

    it("counts objects by a field", () => {
        const people = [
            { name: "A", city: "Pune" },
            { name: "B", city: "Delhi" },
            { name: "C", city: "Pune" },
        ];
        expect(countBy(people, (p) => p.city)).toEqual({ Pune: 2, Delhi: 1 });
    });

    it("works with number keys", () => {
        expect(countBy([1.2, 1.8, 2.5], (n) => Math.floor(n))).toEqual({
            1: 2,
            2: 1,
        });
    });

    it("returns an empty object for an empty list", () => {
        expect(countBy([], () => "x")).toEqual({});
    });

    it("does not mutate the input", () => {
        const input = ["a", "b", "a"];
        const before = structuredClone(input);

        countBy(input, (s) => s);

        expect(input).toEqual(before);
    });
});