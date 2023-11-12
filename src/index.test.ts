import typescriptGraph from './index';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;

describe('typescriptGraph()', () => {
  beforeEach(() => {
    global.warn = jest.fn();
    global.message = jest.fn();
    global.fail = jest.fn();
    global.markdown = jest.fn();
  });

  afterEach(() => {
    global.warn = undefined;
    global.message = undefined;
    global.fail = undefined;
    global.markdown = undefined;
  });

  it('Checks for a that message has been called', () => {
    global.danger = {
      github: { pr: { title: 'My Test Title' } },
      git: {
        modified_files: [],
        created_files: [],
        deleted_files: [],
      },
    };

    typescriptGraph();

    expect(global.message).toHaveBeenCalledWith('PR Title: My Test Title');
  });
});
