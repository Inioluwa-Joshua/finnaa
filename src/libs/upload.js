import toast from "react-hot-toast";

export async function upload(ev, prevLinks = [], callbackFn) {
  const files = ev.target.files;
  if (!files || files.length === 0) return;

  const filteredPrevLinks = prevLinks.filter((link) =>
    link.includes("res.cloudinary.com")
  );
  console.log(prevLinks);

  const uploadPromise = new Promise((resolve, reject) => {
    const data = new FormData();
    Array.from(files).forEach((file) => {
      data.append("file", file);
    });

    if (filteredPrevLinks.length > 0) {
      filteredPrevLinks.forEach((link) => {
        data.append("prevLink", link);
      });
    }

    fetch("/api/cloudinary-upload", {
      method: "POST",
      body: data,
    }).then((response) => {
      if (response.ok) {
        response.json().then((responseData) => {
          const links = responseData.links;
          callbackFn(links);
          resolve(links);
        });
      } else {
        reject();
      }
    });
  });

  await toast.promise(uploadPromise, {
    loading: "Uploading...",
    success: "Uploaded!",
    error: "Upload error!",
  });
}
