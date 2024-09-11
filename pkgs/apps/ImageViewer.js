export default {
  name: "Image Viewer",
  description: "View your epic images in this smooth app.",
  ver: "v1.6.2", // Supports minimum Core version of v1.6.2
  type: "process",
  strings: {
    en_US: {
      imageLoadError: "This does not look like an image",
      backToOverview: "Back to Overview",
      noPictures: "No images found",
      noPicturesTitle: "You have no pictures",
      noPicturesDescription:
        'Upload Photos inside of the "Pictures" folder in the File Manager to get them to show up here.',
      pageOverview: "Overview",
    },
    en_GB: {
      imageLoadError: "This does not appear to be an image",
      backToOverview: "Return to Gallery",
      noPictures: "No images found",
      noPicturesTitle: "You have no pictures",
      noPicturesDescription:
        'Import photos into the "Pictures" folder in the File Manager to get them to show up.',
      pageOverview: "Gallery",
    },
    en_GB: {
      imageLoadError: "This does not appear to be an image",
      backToOverview: "Return to Gallery",
      noPictures: "No images found",
      noPicturesTitle: "You have no pictures",
      noPicturesDescription:
        'Import photos into the "Pictures" folder in the File Manager to get them to show up.',
      pageOverview: "Gallery",
    },
    de_DE: {
      imageLoadError: "Dies scheint kein Bild zu sein",
      backToOverview: "Kehre zur Galerie zurück",
      noPictures: "Keine Bilder gefunden",
      noPicturesTitle: "Sie haben keine Bilder",
      noPicturesDescription:
        'Importieren Sie Fotos in den Ordner "Bilder" im Dateimanager, mit es sie angezeigt werden.',
      pageOverview: "Galerie",
    },
    es_ES: {
      imageLoadError: "Esto no parece ser una imagen",
      backToOverview: "Regreso a la galería",
      noPictures: "No se encuentran imágenes",
      noPicturesTitle: "No tienes fotos",
      noPicturesDescription:
        'Importar fotos en la carpeta "Pictures" en el Administrador de archivos para que aparezcan.',
      pageOverview: "Galería",
    },
    pt_PT: {
      imageLoadError: "Isso não parece ser uma imagem",
      backToOverview: "Retorne à Galeria",
      noPictures: "Nenhuma imagem encontrada",
      noPicturesTitle: "Você não tem fotos",
      noPicturesDescription:
        'Importe fotos para a pasta "Pictures" no gerenciador de arquivos para que elas apareçam.',
      pageOverview: "Galeria",
    },
    fil_PH: {
      imageLoadError: "Hindi ito lilitaw na isang imahe",
      backToOverview: "Bumalik sa gallery",
      noPictures: "Walang nahanap na mga imahe",
      noPicturesTitle: "Wala kang mga larawan",
      noPicturesDescription:
        'Mag-import ng mga larawan sa folder na "Mga Larawan" sa File Manager upang maipakita ang mga ito.',
      pageOverview: "Gallery",
    },
    en_GB: {
      imageLoadError: "Bu bir resim gibi görünmüyor",
      backToOverview: "Galeriye Dön",
      noPictures: "Resim bulunamadı",
      noPicturesTitle: "Hiç resminiz yok",
      noPicturesDescription:
        '"Resimler" klasörüne fotoğraflar ekleyin ve bunların görünmesini sağlamak için Dosya Yöneticisi\'nde yer almasını sağlayın.',
      pageOverview: "Galeri",
    },
  },
  exec: async function (Root) {
    let wrapper;
    let PhotosWindow;

    Root.Lib.setOnEnd(function () {
      PhotosWindow.close();
    });
    const Win = (await Root.Lib.loadLibrary("WindowSystem")).win;

    PhotosWindow = new Win({
      title: Root.Lib.getString("systemApp_ImageViewer"),
      pid: Root.PID,
      width: 445,
      height: 295,
      onclose: () => {
        Root.Lib.onEnd();
      },
    });

    // initializing wrappers and vfs
    wrapper = PhotosWindow.window.querySelector(".win-content");

    const vfs = await Root.Lib.loadLibrary("VirtualFS");
    const FileDialog = await Root.Lib.loadLibrary("FileDialog");
    const FileMappings = await Root.Lib.loadLibrary("FileMappings");

    await vfs.importFS();

    wrapper.classList.add("with-sidebar", "row", "o-h", "h-100");

    const Sidebar = await Root.Lib.loadComponent("Sidebar");

    // this function opens the file and changes the title to the file name,
    // we load the file into a buffer
    async function openFile(path, img) {
      let file;
      if (path) file = path;
      else file = await FileDialog.pickFile("Root");
      if (file === false) return;
      let result = updateImage(await vfs.readFile(file), img);
      if (result === false) return;
      PhotosWindow.setTitle(
        `${Root.Lib.getString("systemApp_ImageViewer")} - ` +
          file.split("/").pop()
      );
      PhotosWindow.focus();
    }

    function updateImage(content, img) {
      // console.log(content);
      if (!content.startsWith("data:image/") && !content.startsWith("blob:")) {
        Root.Modal.alert("Error", Root.Lib.getString("imageLoadError")).then(
          (_) => {
            PhotosWindow.focus();
          }
        );
        return false;
      }
      img.elm.src = content;
    }

    // creates sidebar
    let sidebarWrapper = new Root.Lib.html("div")
      .styleJs({ display: "flex" })
      .appendTo(wrapper);

    let pageWrapper = new Root.Lib.html("div")
      //   .class("ovh", "fg", "fc", "row")
      .style({
        width: "100%",
        height: "100%",
        overflow: "auto",
      })
      .appendTo(wrapper);

    let state = "";

    function makeSidebar() {
      sidebarWrapper.clear();

      let firstItem;

      if (state === "view") {
        firstItem = {
          onclick: async (_) => {
            pages.overview();
          },
          html: Root.Lib.icons.arrowUp,
          title: Root.Lib.getString("backToOverview"),
        };
      } else {
        firstItem = {
          onclick: async (_) => {
            pages.overview();
          },
          html: Root.Lib.icons.refresh,
          title: Root.Lib.getString("refresh"),
        };
      }

      Sidebar.new(sidebarWrapper, [
        firstItem,
        {
          style: {
            "margin-top": "auto",
            "margin-left": "auto",
          },
          onclick: (_) => {
            Root.Modal.alert(
              Root.Lib.getString("noPicturesTitle"),
              Root.Lib.getString("noPicturesDescription"),
              wrapper
            );
          },
          html: Root.Lib.icons.help,
          title: Root.Lib.getString("help"),
        },
      ]);
    }
    makeSidebar();

    let pages = {
      overview: async () => {
        pageWrapper.clear();

        state = "overview";
        makeSidebar();
        PhotosWindow.setTitle(
          `${Root.Lib.getString(
            "systemApp_ImageViewer"
          )} - ${Root.Lib.getString("pageOverview")}`
        );

        let imageGrid = new Root.Lib.html("div")
          .style({
            display: "grid",
            "grid-template-columns": "repeat(auto-fill, minmax(100px, 1fr)",
            transition: "300ms",
          })
          .appendTo(pageWrapper);

        let PicturePath = await vfs.list("Root/Pictures");

        function updImg(content, img) {
          if (
            !content.startsWith("data:image/") &&
            !content.startsWith("blob:")
          ) {
            Root.Modal.alert(
              Root.Lib.getString("error"),
              Root.Lib.getString("imageLoadError")
            ).then((_) => {
              PhotosWindow.focus();
            });
            return false;
          }

          return content;
        }

        if (PicturePath.length === 0) {
          new Root.Lib.html("div")
            .style({
              padding: "1.5rem 1.8rem",
              width: "100%",
              display: "block",
              position: "absolute",
            })
            .text(Root.Lib.getString("noPictures"))
            .appendTo(imageGrid);
          Root.Modal.alert(
            Root.Lib.getString("noPicturesTitle"),
            Root.Lib.getString("noPicturesDescription"),
            wrapper
          );
        }

        PicturePath.forEach(async (element) => {
          let path = "Root/Pictures/" + element.item;
          let file = await vfs.readFile(path);
          const extension = path.split(".").pop();
          let isImage = await FileMappings.getType(extension);

          // non-image checks
          if (isImage === false || isImage !== "image") return;

          let imageWrapper = new Root.Lib.html("div")
            .style({
              width: "100%",
              "aspect-ratio": "1",
              display: "flex",
              "justify-content": "center",
              "align-items": "center",
              "background-color": "var(--header)",
            })
            .appendTo(imageGrid);
          new Root.Lib.html("img")
            .attr({
              src: updImg(file),
            })
            .style({
              width: "100%",
              transition: "width 0.3s ease-in-out",
              "object-fit": "cover",
              height: "100%",
            })
            .on("click", () => {
              pages.view(path);
            })
            .appendTo(imageWrapper);
        });
      },

      view: (path) => {
        pageWrapper.clear();

        state = "view";
        makeSidebar();

        // creates the wrapper that the image is in
        let imgWrapper = new Root.Lib.html("div")
          .class("ovh", "fg", "fc", "row")
          .style({
            height: "100%",
          })
          .appendTo(pageWrapper);

        // creates the actual img element
        let img = new Root.Lib.html("img")
          .appendTo(imgWrapper)
          .style({
            width: "100%",
            height: "100%",
            "object-fit": "contain",
            border: "none",
          })
          .attr({ draggable: "false" });

        openFile(path, img);
      },
    };

    pages.overview();

    return Root.Lib.setupReturns(async (m) => {
      if (m && m.type) {
        if (m.type === "refresh") {
          Root.Lib.getString = m.data;
          PhotosWindow.setTitle(Root.Lib.getString("systemApp_ImageViewer"));
          Root.Lib.updateProcTitle(Root.Lib.getString("systemApp_ImageViewer"));
          makeSidebar();
        }
      }
      if (typeof m === "object" && m.type && m.type === "loadFile" && m.path) {
        // openFile(m.path);
        pages.view(m.path);
      }
    });
  },
};
