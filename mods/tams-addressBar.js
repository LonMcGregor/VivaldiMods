/*
 * Mask for the address bar
 * Written by Tam710562 (https://forum.vivaldi.net/topic/37609/mask-for-the-address-bar/6)
 * With modifications by LonM
 */
/* eslint quotes: ["error", "single"] */
/* eslint indent: ["error", 2] */

(function () {
  const patternURL = /(([a-z-]+):(?!\/\/))?(([^/]+):\/\/)?(([^/?#:]+)(:([^/?#]*))?)?(\/[^?#]*)?(\?[^#]*)?(#(.*))?/i;
  const patternPath = /\/([^/]*)/gi;
  const patternSearch = /[?&]([^=&]+)?(=([^&]*))?/gi;
  let enableDecodeURL = false;
  let isPrivate = false;
  const theme = 'theme-2';
  let searchEngineDefault;
  let searchEngineDefaultPrivate;
  let searchEngines = {};
  let patternSearchEngines;
  const themeSettings = {
    'theme-1': {
      decodeURL: false,
    },
    'theme-2': {
      decodeURL: true,
    },
    'theme-3': {
      decodeURL: false,
    },
  };

  function setSettings(theme, addressfieldMaskEl) {
    if (theme && typeof theme === 'string') {
      if (themeSettings[theme]) {
        enableDecodeURL = themeSettings[theme].decodeURL;
      }
      addressfieldMaskEl.classList.add(theme);
    }
  }

  function encodeHTML(rawStr) {
    return !rawStr ? rawStr : rawStr.replace(/[\u00A0-\u9999<>&"']/gi, function(i) {
      return '&#'+i.charCodeAt(0)+';';
    });
  }

  function urlConvertEncodeHTML(urlConvert) {
    Object.keys(urlConvert).forEach(function(key) {
      urlConvert[key+'HTML'] = encodeHTML(urlConvert[key]);
    });
    return urlConvert;
  }

  function changeValue(addressfieldMaskEl, addressfieldEl, isChange) {
    if (addressfieldMaskEl.dataset.value !== addressfieldEl.value || isChange === true) {
      addressfieldMaskEl.dataset.value = addressfieldEl.value;
      addressfieldMaskEl.innerHTML = getURLColorEl(addressfieldEl.value);
    }
  }

  function createPatternSearchEngines(searchEngineCollection) {
    const engines = searchEngineCollection.engines.filter(e => e.removed !== true);
    if (engines.length > 0) {
      const regKeywords = [];
      engines.forEach(function (engine) {
        searchEngines[engine.keyword] = engine;
        searchEngines[engine.keyword].keywordHTML = encodeHTML(engine.keyword);
        searchEngines[engine.keyword].nameHTML = encodeHTML(engine.name);
        regKeywords.push(engine.keyword.replace(/[-/\\^$*+?.()|[]{}]/g, '\\$&'));

        if (engine.id === searchEngineCollection.default) {
          searchEngineDefault = searchEngines[engine.keyword];
        }
        if (engine.id === searchEngineCollection.defaultPrivate) {
          searchEngineDefaultPrivate = searchEngines[engine.keyword];
        }
      });

      patternSearchEngines = new RegExp('^(' + regKeywords.join('|') + ')\\s(.*)', 'i');
    } else {
      searchEngines = {};
      patternSearchEngines = undefined;
      searchEngineDefault = undefined;
      searchEngineDefaultPrivate = undefined;
    }
  }

  chrome.storage.local.get({
    'SEARCH_ENGINE_COLLECTION': {
      engines: []
    }
  }, function (res) {
    createPatternSearchEngines(res.SEARCH_ENGINE_COLLECTION);
  });

  function createMask(addressfieldEl) {
    const addressfieldParentEl = addressfieldEl.parentElement;
    const addressfieldMaskEl = document.createElement('div');
    addressfieldMaskEl.className = addressfieldEl.className;
    addressfieldMaskEl.classList.add('addressfield-mask');
    addressfieldMaskEl.setAttribute('placeholder', addressfieldEl.placeholder);
    setSettings(theme, addressfieldMaskEl);
    changeValue(addressfieldMaskEl, addressfieldEl);

    chrome.storage.local.onChanged.addListener(function (changes) {
      if (changes.SEARCH_ENGINE_COLLECTION) {
        createPatternSearchEngines(changes.SEARCH_ENGINE_COLLECTION.newValue);
        changeValue(addressfieldMaskEl, addressfieldEl, true);
      }
    });

    const observer = new MutationObserver(function (mutationsList) {
      if (mutationsList[0].attributeName === 'value') {
        changeValue(addressfieldMaskEl, mutationsList[0].target);
      }
    });
    observer.observe(addressfieldEl, {attributes: true});

    addressfieldParentEl.appendChild(addressfieldMaskEl);
  }

  function getURLColorEl(url) {
    const arr = patternURL.exec(url);
    if (arr) {
      const urlConvert = urlConvertEncodeHTML({
        protocolSubFull: arr[1],
        protocolSub: arr[2],
        protocolFull: arr[3],
        protocol: arr[4],
        hostFull: arr[5],
        host: arr[6],
        postFull: arr[7],
        post: arr[8],
        path: arr[9],
        search: arr[10],
        hashFull: arr[11],
        hash: arr[12],
      });
      return [
        typeof urlConvert.protocolSub !== 'undefined' ? '<div class="protocol-sub" data-protocol-sub="' + urlConvert.protocolSubHTML + '">' + urlConvert.protocolSubHTML + '</div>' : '',
        typeof urlConvert.protocol !== 'undefined' ? '<div class="protocol" data-protocol="' + urlConvert.protocolHTML + '">' + urlConvert.protocolHTML + '</div>' : '',
        typeof urlConvert.hostFull !== 'undefined' ? [
          '<div class="host-full" data-host-full="' + urlConvert.hostFullHTML + '">',
          typeof urlConvert.host !== 'undefined' ? getURLHostEl(urlConvert.host, urlConvert) : '',
          typeof urlConvert.postFull !== 'undefined' ? '<div class="post" data-post="' + urlConvert.postHTML + '">' + urlConvert.postHTML + '</div>' : '',
          '</div>'
        ].join('') : '',
        (typeof urlConvert.path !== 'undefined' || typeof urlConvert.search !== 'undefined' || typeof urlConvert.hashFull !== 'undefined') ? [
          '<div class="path-full">',
          urlConvert.path === '/' ? '<div class="path" data-path="/"></div>' : typeof urlConvert.path !== 'undefined' ? '<div class="path" data-path="' + urlConvert.pathHTML + '">' + getURLPathEl(urlConvert.path) + '</div>' : '',
          urlConvert.search === '?' ? '<div class="search" data-search="?"></div>' : typeof urlConvert.search !== 'undefined' ? '<div class="search" data-search="' + urlConvert.searchHTML + '">' + getURLSearchEl(urlConvert.search) + '</div>': '',
          typeof urlConvert.hashFull !== 'undefined' ? '<div class="hash" data-hash="' + urlConvert.hashFullHTML + '">' + (enableDecodeURL === true ? decodeURIComponent(urlConvert.hashHTML) : urlConvert.hashHTML) + '</div>' : '',
          '</div>'
        ].join('') : '',
      ].join('');
    } else {
      return url || '';
    }
  }

  function getURLHostEl(host, urlConvert) {
    if (host.match(/\.[a-z]{2,3}\.[a-z]{2}$/i)) {
      let hostSubHTML, hostMainHTML;
      return host.replace(/((.*)\.)?([^.]+\.[a-z]{2,3}\.[a-z]{2})$/i, function (match, hostSubFull, hostSub, hostMain) {
        hostSubHTML = encodeHTML(hostSub);
        hostMainHTML = encodeHTML(hostMain);
        return [
          '<div class="host with-sub" data-host="' + urlConvert.hostHTML + '">',
          typeof hostSub !== 'undefined' ? '<div class="host-sub" data-host-sub="' + hostSubHTML + '">' + hostSubHTML + '</div>' : '',
          typeof hostMain !== 'undefined' ? '<div class="host-main" data-host-main="' + hostMainHTML + '">' + hostMainHTML + '</div>' : '',
          '</div>'
        ].join('');
      });
    } else if (host.match(/\.[a-z]{2,4}$/i)) {
      let hostSubHTML, hostMainHTML;
      return host.replace(/((.*)\.)?([^.]+\.[a-z]{2,4})$/i, function (match, hostSubFull, hostSub, hostMain) {
        hostSubHTML = encodeHTML(hostSub);
        hostMainHTML = encodeHTML(hostMain);
        return [
          '<div class="host with-sub" data-host="' + urlConvert.hostHTML + '">',
          typeof hostSub !== 'undefined' ? '<div class="host-sub" data-host-sub="' + hostSubHTML + '">' + hostSubHTML + '</div>' : '',
          typeof hostMain !== 'undefined' ? '<div class="host-main" data-host-main="' + hostMainHTML + '">' + hostMainHTML + '</div>' : '',
          '</div>'
        ].join('');
      });
    } else if (patternSearchEngines && host.match(patternSearchEngines)) {
      let searchQueryHTML;
      return host.replace(patternSearchEngines, function (match, searchNickname, searchQuery) {
        searchQueryHTML = encodeHTML(searchQuery);
        return [
          '<div class="search-engine with-nickname">',
          typeof searchNickname !== 'undefined' ? '<div class="search-nickname" data-search-nickname="' + searchEngines[searchNickname].keywordHTML + '" data-search-name="' + searchEngines[searchNickname].nameHTML + '">' + searchEngines[searchNickname].keywordHTML + '</div>' : '',
          typeof searchQuery !== 'undefined' ? '<div class="search-query" data-search-query="' + searchQueryHTML + '">' + (enableDecodeURL === true ? decodeURIComponent(searchQueryHTML) : searchQueryHTML) + '</div>' : '',
          '</div>'
        ].join('');
      });
    } else if (host.match(/^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/i)) {
      return '<div class="host ipv4" data-host="' + urlConvert.hostHTML + '"><div class="host-main" data-host-main="' + urlConvert.hostHTML + '">' + urlConvert.hostHTML + '</div></div>';
    } else if (typeof urlConvert.protocol !== 'undefined') {
      return '<div class="host other" data-host="' + urlConvert.hostHTML + '"><div class="host-other" data-host-other="' + urlConvert.hostHTML + '">' + urlConvert.hostHTML + '</div></div>';
    } else {
      const searchDefault = isPrivate ? searchEngineDefaultPrivate : searchEngineDefault;
      return '<div class="search-engine default" data-search-nickname-default="' + searchDefault.keywordHTML + '" data-search-name-default="' + searchDefault.nameHTML + '"><div class="search-query" data-search-query="' + urlConvert.hostHTML + '">' + urlConvert.hostHTML + '</div></div>';
    }
  }

  function getURLPathEl(path) {
    let pathItemHTML;
    return path.replace(patternPath, function (match, pathItem) {
      pathItemHTML = encodeHTML(pathItem);
      return (typeof match !== 'undefined' ? '<div class="path-item" data-path-item="' + pathItemHTML + '">' + (enableDecodeURL === true ? decodeURIComponent(pathItemHTML) : pathItemHTML) + '</div>' : '');
    });
  }

  function getURLSearchEl(search) {
    let keyHTML, valueHTML;
    return search.replace(patternSearch, function (match, key, valueFull, value) {
      keyHTML = encodeHTML(key);
      valueHTML = encodeHTML(value);
      return [
        '<div class="search-item">',
        typeof key !== 'undefined' ? '<div class="search-key" data-search-key="' + keyHTML + '">' + (enableDecodeURL === true ? decodeURIComponent(keyHTML) : keyHTML) + '</div>' : '',
        typeof valueFull !== 'undefined' ? '<div class="search-value" data-search-value="' + valueHTML + '">' + (enableDecodeURL === true ? decodeURIComponent(valueHTML) : valueHTML) + '</div>' : '',
        '</div>'
      ].join('');
    });
  }

  setTimeout(function wait() {
    const addressfieldEl = document.querySelector('input.url.vivaldi-addressfield');
    if (addressfieldEl) {
      isPrivate = document.getElementById('browser').classList.contains('private');
      createMask(addressfieldEl);
    } else {
      setTimeout(wait, 300);
    }
  }, 300);
}());
