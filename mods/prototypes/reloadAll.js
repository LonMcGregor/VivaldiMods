

        ReloadAll: {
            title: "Reload all tabs at once",
            content_script: false,
            script: () => {
                chrome.tabs.query({}, tabs => {
                    tabs.forEach(tab => {
                        chrome.tabs.reload(tab.id);
                    });
                });
            },
            display: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M4.5 4.5C5.4 3.6 6.6 3 8 3c2.8 0 5 2.2 5 5h2c0-3.9-3.1-7-7-7-1.9 0-3.7.8-4.9 2.1L1 1v6h6L4.5 4.5zM11.5 11.5c-.9.9-2.1 1.5-3.5 1.5-2.8 0-5-2.2-5-5H1c0 3.9 3.1 7 7 7 1.9 0 3.7-.8 4.9-2.1L15 15V9H9l2.5 2.5z"></path>
          </svg>`,
          css_class: "button-toolbar-small",
          where_type: "BEFORE",
          where_selector: "#footer > div.sync-status",
          additional_css: ``
        }
