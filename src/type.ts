export interface PluginOptions {
  /**
  * Whether to check for updates when the window is focused.
  */
  checkOnWindowFocus?: boolean;

  /**
   * Whether to check for updates when a resource fails to load.
   */
  checkOnResourceFilesError?: boolean;

  /**
  * The interval (in milliseconds) at which to check for updates.
  * Default is 60000 (1 minute).
  */
  checkInterval?: number;

  /**
  * The public URL of the application.
  */
  publicUrl?: string;


};