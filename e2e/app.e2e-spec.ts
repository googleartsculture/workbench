import { HomePage } from './app.po';

describe('Workbench App', () => {
  let page: HomePage;

  beforeEach(() => {
    page = new HomePage();
  });

  it('should display heading saying "Workbench"', () => {
    page.navigateTo();
    expect(page.getHeadingText()).toEqual('Workbench');
  });
});
