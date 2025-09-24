import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn utility', () => {
  it('should combine class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
  });

  it('should handle undefined and null values', () => {
    const result = cn('class1', undefined, null, 'class2');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
    expect(result).not.toContain('undefined');
    expect(result).not.toContain('null');
  });

  it('should handle conditional classes', () => {
    const condition = true;
    const result = cn('base-class', condition && 'conditional-class');
    expect(result).toContain('base-class');
    expect(result).toContain('conditional-class');
  });

  it('should not include falsy conditional classes', () => {
    const condition = false;
    const result = cn('base-class', condition && 'conditional-class');
    expect(result).toContain('base-class');
    expect(result).not.toContain('conditional-class');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(typeof result).toBe('string');
  });

  it('should handle Tailwind CSS class conflicts', () => {
    // Test tailwind-merge functionality - later classes should override earlier ones
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('should handle complex class combinations', () => {
    const result = cn(
      'px-4 py-2',
      'bg-blue-500',
      false && 'hidden',
      true && 'text-white'
    );
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('text-white');
    expect(result).not.toContain('hidden');
  });
});
