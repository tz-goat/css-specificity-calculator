const { parseCSSSpecificity } = require('./index.js');

describe('CSS Specificity Parser', () => {
    // 测试基础选择器
    test('基础选择器测试', () => {
        expect(parseCSSSpecificity('div')).toEqual({ a: 0, b: 0, c: 1 });
        expect(parseCSSSpecificity('.class')).toEqual({ a: 0, b: 1, c: 0 });
        expect(parseCSSSpecificity('#id')).toEqual({ a: 1, b: 0, c: 0 });
    });

    // 测试组合选择器
    test('组合选择器测试', () => {
        expect(parseCSSSpecificity('div.class')).toEqual({ a: 0, b: 1, c: 1 });
        expect(parseCSSSpecificity('div#id')).toEqual({ a: 1, b: 0, c: 1 });
        expect(parseCSSSpecificity('.class1.class2')).toEqual({ a: 0, b: 2, c: 0 });
    });

    // 测试复杂选择器
    test('复杂选择器测试', () => {
        expect(parseCSSSpecificity('div.class > p')).toEqual({ a: 0, b: 1, c: 2 });
        expect(parseCSSSpecificity('#header > .nav')).toEqual({ a: 1, b: 1, c: 0 });
        expect(parseCSSSpecificity('div.class1.class2 > p.text')).toEqual({ a: 0, b: 3, c: 2 });
    });

    // 测试非法选择器
    test('非法选择器测试', () => {
        expect(parseCSSSpecificity('123')).toBeUndefined();
        expect(parseCSSSpecificity('.123')).toBeUndefined();
        expect(parseCSSSpecificity('#123')).toBeUndefined();
        expect(parseCSSSpecificity('')).toBeUndefined();
    });

    // 测试空格分隔的选择器
    test('空格分隔的选择器测试', () => {
        expect(parseCSSSpecificity('div .class')).toEqual({ a: 0, b: 1, c: 1 });
        expect(parseCSSSpecificity('header nav .menu')).toEqual({ a: 0, b: 1, c: 2 });
    });

    // 测试组合符号
    test('组合符号测试', () => {
        expect(parseCSSSpecificity('div > .class')).toEqual({ a: 0, b: 1, c: 1 });
        expect(parseCSSSpecificity('div + .class')).toEqual({ a: 0, b: 1, c: 1 });
        expect(parseCSSSpecificity('div ~ .class')).toEqual({ a: 0, b: 1, c: 1 });
    });

    // 测试伪类选择器
    test('伪类选择器测试', () => {
        expect(parseCSSSpecificity('a:hover')).toEqual({ a: 0, b: 1, c: 1 });
        expect(parseCSSSpecificity('li:nth-child(2n)')).toEqual({ a: 0, b: 1, c: 1 });
    });

    // 测试属性选择器
    test('属性选择器测试', () => {
        expect(parseCSSSpecificity('input[type="text"]')).toEqual({ a: 0, b: 1, c: 1 });
        expect(parseCSSSpecificity('a[href^="https"]')).toEqual({ a: 0, b: 1, c: 1 });
    });
}); 