import { FxpracticeFrontendPage } from './app.po';

describe('fxpractice-frontend App', function() {
  let page: FxpracticeFrontendPage;

  beforeEach(() => {
    page = new FxpracticeFrontendPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
