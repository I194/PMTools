var currWinBody = document.body;

function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text);
    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

function putCopyColBtn(targetId) {
  return "<button class='CopyColumn btn btn-sm btn-link pb-0 pt-0 pr-0 mb-1' data-target='" + targetId + "' onclick='getColumn(event)'><i class='far fa-copy'></i></button>"
}

function getColumn(event) {
  currWinBody = event.target.ownerDocument.body;

  var btn = $(event.currentTarget);

  // Disable the button whilst the clipboard copy is performed
  btn.prop("disabled", true);

  var colData = "";

  // Use a line break to seperate the column data if no separator is specified
  var colSeparator = (btn.data("separator")===undefined) ? "\n" : btn.data("separator");

  // Loop through all elements with the target class
  $(btn.data("target")).each(function() {
      // Collect the column data and add the separator
      colData += $(this).text() + colSeparator;
  });

  // Copy the column data to the clipboard
  copyToClipboard(colData.trim());

  // Make a copy of the button text
  var btn_txt = btn.html();

  // Change the button text to "Copied"
  btn.html("<i class='fas fa-copy'></i>");

  // Revert the button text after 1 second
  setTimeout(function(){
      btn.html(btn_txt);
      // Enable the button
      btn.prop("disabled", false);
      // Change the button text to "Copied"
      btn.html("<i class='far fa-copy'></i>");
  },1000);
}
