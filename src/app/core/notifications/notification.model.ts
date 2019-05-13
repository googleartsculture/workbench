export class Notification {
  type: String;
  message: String;
  id: String;

  constructor (init?: Partial<Notification>) {
    Object.assign(this, init);
  }
}
