/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'jest-environment-jsdom', // Указываем правильный модуль окружения
    transform: {
      '^.+\\.tsx?$': [
        'ts-jest',
        {
          useESM: true,
        },
      ],
    },
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
  };
  