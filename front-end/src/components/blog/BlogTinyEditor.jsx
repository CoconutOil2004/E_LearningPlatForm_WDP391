/**
 * BlogTinyEditor
 * Compatible with Ant Design Form.Item via:
 *   trigger="onEditorChange"
 *   validateTrigger={["onEditorChange"]}
 *
 * Form.Item auto-injects: value, onEditorChange
 * Custom props: height, onWordCount, onLoaded, uploadImage, disabled, placeholder
 */
import { Editor } from "@tinymce/tinymce-react";
import { Spin } from "antd";
import { useRef, useState } from "react";
import UserService from "../../services/api/UserService";

const BlogTinyEditor = (props) => {
  const {
    value,
    onEditorChange,
    height = "60vh",
    onWordCount = () => { },
    onLoaded = () => { },
    uploadImage,
    disabled = false,
    placeholder = "Start writing your blog post...",
  } = props;

  const [loading, setLoading] = useState(true);
  const editorRef = useRef(null);
  const initialLoadRef = useRef(true);
  const useDarkMode = false;

  // Upload image to Cloudinary via UserService
  const handleImagesUpload = async (blobInfo) => {
    try {
      const file = new File(
        [blobInfo.blob()],
        blobInfo.filename() || "image.png",
        { type: blobInfo.blob().type }
      );
      const uploader = uploadImage || ((f) => UserService.uploadImage(f));
      const res = await uploader(file);
      if (res?.url) return res.url;
      if (typeof res === "string") return res;
      throw new Error("Image upload failed");
    } catch (err) {
      console.error("TinyMCE image upload error:", err);
      throw err;
    }
  };

  // file_picker_callback: pick image/video from disk and upload
  const handleFilePicker = (cb, _value, meta) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", meta.filetype === "media" ? "video/*" : "image/*");
    input.onchange = async function () {
      const file = input.files[0];
      if (!file) return;
      try {
        const uploader = uploadImage || ((f) => UserService.uploadImage(f));
        const res = await uploader(file);
        const url = res?.url || (typeof res === "string" ? res : null);
        if (url) cb(url, { title: file.name });
      } catch {
        // Fallback to blob URI if upload fails
        const reader = new FileReader();
        reader.onload = function () {
          const id = "blobid" + Date.now();
          const blobCache = editorRef.current?.editorUpload?.blobCache;
          if (blobCache) {
            const base64 = reader.result.split(",")[1];
            const blobInfo = blobCache.create(id, file, base64);
            blobCache.add(blobInfo);
            cb(blobInfo.blobUri(), { title: file.name });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div style={{ position: "relative" }}>
      {loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(255,255,255,0.85)", borderRadius: 8, minHeight: 200,
        }}>
          <Spin tip="Loading editor..." />
        </div>
      )}

      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        value={value}
        onEditorChange={(content, editor) => {
          if (initialLoadRef.current) {
            initialLoadRef.current = false;
            // Prevent first internal load event from triggering validation if empty
            if (!content || content === "<p><br data-mce-bogus=\"1\"></p>") return;
          }
          onEditorChange && onEditorChange(content);
        }}
        disabled={disabled}
        init={{
          height,
          min_height: 400,
          resize: true,

          plugins: [
            "preview", "importcss", "searchreplace", "autolink", "autosave",
            "save", "directionality", "code", "visualblocks", "visualchars",
            "fullscreen", "image", "link", "media", "codesample", "table",
            "charmap", "pagebreak", "nonbreaking", "anchor", "insertdatetime",
            "advlist", "lists", "wordcount", "help", "quickbars",
          ],

          menubar: "file edit view insert format tools table help",

          toolbar:
            "undo redo | " +
            "blocks fontfamily fontsize | " +
            "bold italic underline strikethrough | " +
            "forecolor backcolor | " +
            "alignleft aligncenter alignright alignjustify | " +
            "lineheight outdent indent | " +
            "numlist bullist | " +
            "link image media codesample | " +
            "table charmap | " +
            "fullscreen preview | " +
            "removeformat",

          toolbar_mode: "sliding",

          quickbars_selection_toolbar:
            "bold italic underline | quicklink h2 h3 blockquote | forecolor backcolor",
          quickbars_insert_toolbar: "quickimage quicktable",

          font_size_formats:
            "8px 10px 12px 14px 16px 18px 20px 24px 28px 32px 36px 40px 48px 56px 64px",
          font_family_formats:
            "Arial=arial,helvetica,sans-serif;" +
            "Helvetica=helvetica,sans-serif;" +
            "Georgia=georgia,palatino,serif;" +
            "Times New Roman=times new roman,times,serif;" +
            "Courier New=courier new,courier,monospace;" +
            "Verdana=verdana,geneva,sans-serif;" +
            "Tahoma=tahoma,geneva,sans-serif;",
          line_height_formats: "1 1.2 1.4 1.5 1.6 1.8 2 2.5 3",

          // ── Image alignment styles (shown in Format > Image menu) ──
          image_style_formats: [
            {
              title: "Full width",
              selector: "img",
              styles: { display: "block", width: "100%", height: "auto", margin: "16px 0", borderRadius: "10px" },
            },
            {
              title: "Centered",
              selector: "img",
              styles: { display: "block", maxWidth: "100%", height: "auto", margin: "16px auto", borderRadius: "10px" },
            },
            {
              title: "Float left",
              selector: "img",
              styles: { float: "left", maxWidth: "45%", height: "auto", margin: "8px 20px 8px 0", borderRadius: "8px" },
            },
            {
              title: "Float right",
              selector: "img",
              styles: { float: "right", maxWidth: "45%", height: "auto", margin: "8px 0 8px 20px", borderRadius: "8px" },
            },
          ],

          // ── Content styles: proper image rendering inside editor ──
          content_style: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                Helvetica, Arial, sans-serif;
              font-size: 15px;
              line-height: 1.8;
              color: #1a1a1a;
              max-width: 100%;
              padding: 16px 20px;
              margin: 0;
            }
            h1 { font-size: 2em; font-weight: 800; margin: 28px 0 14px; line-height: 1.2; letter-spacing: -0.02em; }
            h2 { font-size: 1.5em; font-weight: 700; margin: 24px 0 12px; line-height: 1.3; }
            h3 { font-size: 1.25em; font-weight: 700; margin: 20px 0 10px; }
            h4 { font-size: 1.1em; font-weight: 600; margin: 16px 0 8px; }
            p  { margin: 0 0 16px; }
            a  { color: #6366f1; text-decoration: underline; }
            a:hover { color: #4f46e5; }
            blockquote {
              border-left: 4px solid #6366f1;
              padding: 12px 20px;
              margin: 20px 0;
              color: #555;
              font-style: italic;
              background: rgba(99,102,241,0.04);
              border-radius: 0 8px 8px 0;
            }
            pre {
              background: #1e1e2e;
              color: #cdd6f4;
              border-radius: 10px;
              padding: 16px 20px;
              font-family: 'Fira Code', 'Courier New', monospace;
              font-size: 13px;
              overflow-x: auto;
              margin: 16px 0;
              line-height: 1.6;
            }
            code {
              background: #f1f0fe;
              color: #6366f1;
              border-radius: 4px;
              padding: 2px 6px;
              font-family: 'Fira Code', 'Courier New', monospace;
              font-size: 0.875em;
            }
            pre code { background: none; color: inherit; padding: 0; }

            /* ── Images: preserve natural aspect ratio, never crop ── */
            img {
              max-width: 100%;
              height: auto;         /* always auto — never distort */
              display: block;
              margin: 16px auto;
              border-radius: 10px;
            }
            /* Clearfix for floated images */
            p:has(img[style*="float"]) { overflow: hidden; }
            img[style*="float:left"],
            img[style*="float: left"]  { margin: 8px 20px 8px 0; }
            img[style*="float:right"],
            img[style*="float: right"] { margin: 8px 0 8px 20px; }

            ul, ol { padding-left: 28px; margin: 0 0 16px; }
            li { margin: 6px 0; line-height: 1.7; }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 16px 0;
            }
            th {
              background: #f8f8ff;
              font-weight: 700;
              border: 1px solid #e2e2f0;
              padding: 10px 14px;
              text-align: left;
            }
            td { border: 1px solid #e5e7eb; padding: 10px 14px; }
            tr:nth-child(even) td { background: #fafafe; }
            hr { border: none; border-top: 2px solid #f1f0fe; margin: 24px 0; }
            .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
              color: #9ca3af;
              font-style: normal;
            }
          `,

          skin: useDarkMode ? "oxide-dark" : "oxide",
          content_css: useDarkMode ? "dark" : "default",

          // Image upload config
          images_file_types: "svg,jpeg,jpg,jpe,jfi,jif,jfif,png,gif,bmp,webp",
          image_advtab: true,
          image_caption: true,
          image_class_list: [
            { title: "Default", value: "" },
            { title: "Rounded", value: "img-rounded" },
          ],
          images_upload_handler: handleImagesUpload,
          file_picker_types: "image media",
          file_picker_callback: handleFilePicker,
          paste_data_images: true,
          block_unsupported_drop: false,

          media_poster: false,
          media_alt_source: false,

          codesample_languages: [
            { text: "JavaScript", value: "javascript" },
            { text: "TypeScript", value: "typescript" },
            { text: "HTML/XML", value: "markup" },
            { text: "CSS", value: "css" },
            { text: "Python", value: "python" },
            { text: "Java", value: "java" },
            { text: "C/C++", value: "cpp" },
            { text: "Go", value: "go" },
            { text: "Rust", value: "rust" },
            { text: "Bash/Shell", value: "bash" },
            { text: "SQL", value: "sql" },
            { text: "JSON", value: "json" },
            { text: "Markdown", value: "markdown" },
          ],

          autosave_ask_before_unload: false,
          autosave_interval: "30s",
          autosave_prefix: "blog-draft-{path}{query}-{id}-",
          autosave_restore_when_empty: false,
          autosave_retention: "5m",

          table_responsive_width: true,
          table_default_styles: { width: "100%" },

          deprecation_warnings: false,
          branding: false,
          promotion: false,
          placeholder,
          importcss_append: true,
          contextmenu: "link image imagetools table",
          nonbreaking_force_tab: true,

          setup: (editor) => {
            editorRef.current = editor;
            editor.on("init", () => { setLoading(false); onLoaded(editor); });
            editor.on("FullscreenStateChanged", (e) => {
              // fullscreen state tracking if needed
            });
            editor.on("WordCountUpdate", (e) => {
              onWordCount(e?.wordCount ?? { words: 0, characters: 0 });
            });
          },
        }}
      />
    </div>
  );
};

export default BlogTinyEditor;