declare module "pdfmake/build/pdfmake" {
  import * as pdfMake from "pdfmake";
  export = pdfMake;
}

declare module "pdfmake/build/vfs_fonts" {
  const vfs: Record<string, string>;
  export default vfs;
}
