import { test } from '@/index';
import { Network } from '@/enums';
import { describe, it, expect } from 'vitest';

describe('main', () => {
  it('should log the network', () => {
    expect(test(Network.MAINNET)).toBe(Network.MAINNET);
  });
});
