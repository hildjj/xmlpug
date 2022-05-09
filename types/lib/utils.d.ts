/**
 * Combine multiple objects together, such that child objects and arrays are
 * additive.
 *
 * @param {object[]} args The objects to combine.
 * @returns {object} The combined object.
 * @throws {Error} Unknown type.
 */
export function combine(...args: object[]): object;
