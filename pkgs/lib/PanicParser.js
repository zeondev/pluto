let L = {};
let C = {};
let vfs = {};

export default {
  name: "Code Scanner",
  description: "Scans application files for dangerous code.",
  ver: "v1.6.2", // Supports minimum Core version of v1.6.2
  type: "library",
  init: async (l, c) => {
    L = l;
    C = c;
    vfs = await L.loadLibrary("VirtualFS");
    await vfs.importFS();
  },
  data: {
    // exported functions here
    async scanPanicFolder() {
      let folder = "Root/Pluto/panics";
      const list = []; // Create an empty array to store the results

      async function scanSubFolder(folder) {
        // Create a helper function for recursive calls
        const fileList = await vfs.list(folder);

        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          const filePath = `${folder}/${file.item}`;
          const fileType = file.type;

          if (fileType === "file") {
            try {
              const fileContent = await vfs.readFile(filePath);
              const result = {
                success: true,
                filename: file.item,
                path: folder,
                content: fileContent,
              };
              list.push(result);
              // console.log(result);
            } catch (error) {
              const result = {
                success: false,
                filename: file.item,
                path: folder,
                content: error,
              };
              list.push(result);
              // console.log(result);
            }
          } else if (fileType === "dir") {
            await scanSubFolder(filePath); // Recursive call to scan subfolder
          }
        }
      }

      await scanSubFolder(folder); // Initial call to start scanning the root folder

      // console.log(list); // Print the final list once finished

      // Only include the .panic files
      let endlist = list.filter((file) => file.filename.endsWith(".panic"));

      return endlist; // Return the list for further processing if needed
    },
  },
};
