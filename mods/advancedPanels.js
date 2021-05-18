/*
* Sessions Panel (a mod for Vivaldi)
* Written by LonM, modified by boroda
* No Copyright Reserved
*
* ko translation by @dencion
* it by @folgore101
* de by @knoelli
* nl by @Vistaus
* jp by @nkay1005
* pt-br by @oinconquistado
* pl-pl by @supra107
* ru by @boroda
*/

(function advancedPanels(){
    "use strict";

    var oldNameDate;
    var selectedSessions;

    const privateWindowsNotSavedFilenamePostfix = '!';
    const privateWindowsOnlyFilenamePostfix = '!!';

    const privateWindowsNotSavedDisplayedPostfix = '*\u2002\u2002';
    const privateWindowsOnlyDisplayedPostfix = '**\u2002';

    const LANGUAGE = 'en_gb'; //en_gb, ru, etc.

    const l10n = {
        en_gb: {
            title: 'Sessions',
            new_session: 'New Session',
            session_name_placeholder: 'Session Name',
            all_windows: 'All Windows',
            only_selected: 'Only Selected Tabs',
            add_session_btn: 'Add Session',
            refresh_sessions_btn: '⇄',
            saved_sessions: 'Saved Sessions',
            sort_title: 'Sort by...',
            sort_date: 'Sort by Date',
            sort_name: 'Sort by Name',
            sort_asc: 'Sort Ascending',
            sort_desc: 'Sort Descending',
            delete_button: 'Delete session',
            delete_prompt: 'Are you sure you want to delete session $T?',
            delete_number_sessions: 'Are you sure you want to delete $N selected sessions?',
            delete_number_sessions_general: '',
            number_sessions_1_form: '',
            number_sessions_2_4_form: '',
            number_sessions_5_20_form: '',
            delete_confirm: '⚠ Yes, delete',
            action_cancel: 'No, don\'t',
            open_number_sessions: 'Are you sure you want to open $N selected sessions?',
            open_number_sessions_general: '',
            open_confirm: '⚠ Yes, open',
            time_created_label: 'Created <time></time>',
            today_label: 'today',
            open_in_new_window_button: 'Open in new window',
            open_in_current_window_button: 'Open in current window',
            private_windows_not_saved_label: 'Private window(s) not saved',
            private_windows_only_label: 'Private window(s) only',
            tabs_label: 'Tabs: ',
            windows_label: 'windows: '
        },
        ru: {
            title: 'Сессии',
            new_session: 'Новая сессия',
            session_name_placeholder: 'Имя сессии',
            all_windows: 'Все окна',
            only_selected: 'Выбранные вкладки',
            add_session_btn: 'Добавить сессию',
            refresh_sessions_btn: '⇄',
            saved_sessions: 'Сохраненные сессии',
            sort_title: 'Сортировать по...',
            sort_date: 'Сортировать по дате',
            sort_name: 'Сортировать по имени',
            sort_asc: 'По возрастанию',
            sort_desc: 'По убыванию',
            delete_button: 'Удалить сессию',
            delete_prompt: 'Вы уверены, что хотите удалить сессию $T?',
            delete_number_sessions: 'Вы уверены, что хотите удалить $N выбранные сессии?',
            delete_number_sessions_general: 'Вы уверены, что хотите удалить $N?',
            number_sessions_1_form: 'выбранную сессию',
            number_sessions_2_4_form: 'выбранные сессии',
            number_sessions_5_20_form: 'выбранных сессий',
            delete_confirm: '⚠ Да, удалить',
            action_cancel: 'Нет, не надо',
            open_number_sessions: 'Вы уверены, что хотите открыть $N выбранные сессии?',
            open_number_sessions_general: 'Вы уверены, что хотите открыть $N?',
            open_confirm: '⚠ Да, открыть',
            time_created_label: 'Создано <time></time>',
            today_label: 'сегодня',
            open_in_new_window_button: 'Открыть в новом окне',
            open_in_current_window_button: 'Открыть в текущем окне',
            private_windows_not_saved_label: 'Приватные окна не сохранены',
            private_windows_only_label: 'Только приватные окна',
            tabs_label: 'Вкладок: ',
            windows_label: 'окон: '
        },
        ko: {
            title: '세션',
            new_session: '새로운 세션',
            session_name_placeholder: '세션 이름',
            all_windows: '모든 창',
            only_selected: '선택한 탭만',
            add_session_btn: '세션 추가',
            refresh_sessions_btn: '⇄',
            saved_sessions: 'Saved Sessions',
            sort_title: '정렬',
            sort_date: '날짜순 정렬',
            sort_name: '이름순 정렬',
            sort_asc: '오름차순 정렬',
            sort_desc: '내림차순 정렬',
            delete_button: '이 세션을 지우기',
            delete_prompt: '$T 세션을 지우시겠습니까?',
            delete_number_sessions: '선택한 $N개의 세션을 지우시겠습니까?',
            delete_number_sessions_general: '',
            number_sessions_1_form: '',
            number_sessions_2_4_form: '',
            number_sessions_5_20_form: '',
            delete_confirm: '⚠네',
            action_cancel: '아니오',
            open_number_sessions: 'Are you sure you want to open $N selected sessions?',
            open_number_sessions_general: '',
            open_confirm: '⚠ Yes, open',
            time_created_label: '만든 시각 <time></time>',
            today_label: 'today',
            open_in_new_window_button: '새 창에서 열기',
            open_in_current_window_button: '현재 창에서 열기',
            private_windows_not_saved_label: 'Private window(s) not saved',
            private_windows_only_label: 'Private window(s) only',
            tabs_label: 'Tabs: ',
            windows_label: 'windows: '
        },
        it: {
            title: 'Sessioni',
            new_session: 'Nuova sessione',
            session_name_placeholder: 'Nome sessione',
            all_windows: 'Tutte le finestre',
            only_selected: 'Solo schede selezionate',
            add_session_btn: 'Aggiungi sessione',
            refresh_sessions_btn: '⇄',
            saved_sessions: 'Saved Sessions',
            sort_title: 'Ordina per...',
            sort_date: 'Ordina per data',
            sort_name: 'Ordina per nome',
            sort_asc: 'Ordine crescente',
            sort_desc: 'Ordine decrescente',
            delete_button: 'Elimina questa sessione',
            delete_prompt: 'Sei sicuro di voler eliminare $T?',
            delete_number_sessions: 'Sei sicuro di voler eliminare $N sessioni selezionate?',
            delete_number_sessions_general: '',
            number_sessions_1_form: '',
            number_sessions_2_4_form: '',
            number_sessions_5_20_form: '',
            delete_confirm: '⚠ Sì, Elimina',
            action_cancel: 'No, non farlo',
            open_number_sessions: 'Are you sure you want to open $N selected sessions?',
            open_number_sessions_general: '',
            open_confirm: '⚠ Yes, open',
            time_created_label: 'Creata <time></time>',
            today_label: 'today',
            open_in_new_window_button: 'Apri in una nuova finestra',
            open_in_current_window_button: 'Apri nella finestra corrente',
            private_windows_not_saved_label: 'Private window(s) not saved',
            private_windows_only_label: 'Private window(s) only',
            tabs_label: 'Tabs: ',
            windows_label: 'windows: '
        },
        de: {
            title: 'Sitzungen',
            new_session: 'Neue Sitzung',
            session_name_placeholder: 'Name der Sitzung',
            all_windows: 'Alle Fenster',
            only_selected: 'Nur ausgewählte Tabs',
            add_session_btn: 'Sitzung hinzufügen',
            refresh_sessions_btn: '⇄',
            saved_sessions: 'Saved Sessions',
            sort_title: 'Sortieren nach...',
            sort_date: 'Sortieren nach Datum',
            sort_name: 'Sortieren nach Namen',
            sort_asc: 'Aufsteigend sortieren',
            sort_desc: 'Absteigend sortieren',
            delete_button: 'Diese Sitzung löschen',
            delete_prompt: 'Wollen Sie $T wirklich löschen?',
            delete_number_sessions: 'Wollen Sie die $N ausgewählten Sitzungen wirklich löschen?',
            delete_number_sessions_general: '',
            number_sessions_1_form: '',
            number_sessions_2_4_form: '',
            number_sessions_5_20_form: '',
            delete_confirm: '⚠ Ja, löschen',
            action_cancel: 'Nein',
            open_number_sessions: 'Are you sure you want to open $N selected sessions?',
            open_number_sessions_general: '',
            open_confirm: '⚠ Yes, open',
            time_created_label: 'Erstellt <time></time>',
            today_label: 'today',
            open_in_new_window_button: 'In neuem Fenster öffnen',
            open_in_current_window_button: 'Im aktuellen Fenster öffnen',
            private_windows_not_saved_label: 'Private window(s) not saved',
            private_windows_only_label: 'Private window(s) only',
            tabs_label: 'Tabs: ',
            windows_label: 'windows: '
        },
            nl: {
            title: 'Sessies',
            new_session: 'Nieuwe sessie',
            session_name_placeholder: 'Sessienaam',
            all_windows: 'Alle vensters',
            only_selected: 'Alleen geselecteerde tabbladen',
            add_session_btn: 'Sessie toevoegen',
            refresh_sessions_btn: '⇄',
            saved_sessions: 'Saved Sessions',
            sort_title: 'Sorteren op...',
            sort_date: 'Sorteren op datum',
            sort_name: 'Sorteren op naam',
            sort_asc: 'Oplopend sorteren',
            sort_desc: 'Aflopend sorteren',
            delete_button: 'Sessie verwijderen',
            delete_prompt: 'Weet u zeker dat u $T wilt verwijderen?',
            delete_number_sessions: 'Weet u zeker dat u $N geselecteerde sessies wilt verwijderen?',
            delete_number_sessions_general: '',
            number_sessions_1_form: '',
            number_sessions_2_4_form: '',
            number_sessions_5_20_form: '',
            delete_confirm: '⚠ Ja, verwijderen',
            action_cancel: 'Nee, behouden',
            open_number_sessions: 'Are you sure you want to open $N selected sessions?',
            open_number_sessions_general: '',
            open_confirm: '⚠ Yes, open',
            time_created_label: 'Toegevoegd om <time></time>',
            today_label: 'today',
            open_in_new_window_button: 'Openen in nieuw venster',
            open_in_current_window_button: 'Openen in huidig venster',
            private_windows_not_saved_label: 'Private window(s) not saved',
            private_windows_only_label: 'Private window(s) only',
            tabs_label: 'Tabs: ',
            windows_label: 'windows: '
        },
        ja: {
            title: 'セッション',
            new_session: '新しいセッション',
            session_name_placeholder: 'セッション名',
            all_windows: '全てのウィンドウ',
            only_selected: '選択したタブのみ',
            add_session_btn: 'セッションを保存',
            refresh_sessions_btn: '⇄',
            saved_sessions: 'Saved Sessions',
            sort_title: '並べ替え...',
            sort_date: '日付で並べ替え',
            sort_name: 'セッション名で並べ替え',
            sort_asc: '昇順に並べ替え',
            sort_desc: '降順に並べ替え',
            delete_button: 'セッションを削除',
            delete_prompt: '$T を削除しますか？',
            delete_number_sessions: '選択した$N個のセッションを削除しますか？',
            delete_number_sessions_general: '',
            number_sessions_1_form: '',
            number_sessions_2_4_form: '',
            number_sessions_5_20_form: '',
            delete_confirm: '⚠ 削除',
            action_cancel: 'キャンセル',
            open_number_sessions: 'Are you sure you want to open $N selected sessions?',
            open_number_sessions_general: '',
            open_confirm: '⚠ Yes, open',
            time_created_label: '作成日 <time></time>',
            today_label: 'today',
            open_in_new_window_button: '新しいウィンドウで開く',
            open_in_current_window_button: '現在のウィンドウで開く',
            private_windows_not_saved_label: 'Private window(s) not saved',
            private_windows_only_label: 'Private window(s) only',
            tabs_label: 'Tabs: ',
            windows_label: 'windows: '
        },
        pt_br: {
            title: 'Sessões',
            new_session: 'Nova sessão',
            session_name_placeholder: 'Nome da sessão',
            all_windows: 'Todas as janelas',
            only_selected: 'Apenas abas selecionadas',
            add_session_btn: 'Adicionar sessão',
            refresh_sessions_btn: '⇄',
            saved_sessions: 'Saved Sessions',
            sort_title: 'Organizar por...',
            sort_date: 'Organizar por data',
            sort_name: 'Organizar por nome',
            sort_asc: 'Organizar por ordem crescente',
            sort_desc: 'Organizar por ordem decrescente',
            delete_button: 'Deletar essa sessão',
            delete_prompt: 'Você deseja deletar $T?',
            delete_number_sessions: 'Você deseja deletar $N sessões selecionadas?',
            delete_number_sessions_general: '',
            number_sessions_1_form: '',
            number_sessions_2_4_form: '',
            number_sessions_5_20_form: '',
            delete_confirm: '⚠ Sim, delete',
            action_cancel: 'Não, não deletar',
            open_number_sessions: 'Are you sure you want to open $N selected sessions?',
            open_number_sessions_general: '',
            open_confirm: '⚠ Yes, open',
            time_created_label: 'Criado em <time></time>',
            today_label: 'today',
            open_in_new_window_button: 'Abrir em uma nova janela',
            open_in_current_window_button: 'Abrir na janela atual',
            private_windows_not_saved_label: 'Private window(s) not saved',
            private_windows_only_label: 'Private window(s) only',
            tabs_label: 'Tabs: ',
            windows_label: 'windows: '
        },
        pl_pl: {
            title: 'Sesje',
            new_session: 'Nowa sesja',
            session_name_placeholder: 'Nazwa sesji',
            all_windows: 'Wszystkie okna',
            only_selected: 'Tylko zaznaczone karty',
            add_session_btn: 'Dodaj sesję',
            refresh_sessions_btn: '⇄',
            saved_sessions: 'Saved Sessions',
            sort_title: 'Sortuj według...',
            sort_date: 'Sortuj według daty',
            sort_name: 'Sortuj według nazwy',
            sort_asc: 'Sortuj rosnąco',
            sort_desc: 'Sortuj malejąco',
            delete_button: 'Usuń tę sesję',
            delete_prompt: 'Czy jesteś pewien że chcesz usunąć $T?',
            delete_number_sessions: 'Czy jesteś pewien że chcesz usunąć $N zaznaczonych sesji?',
            delete_number_sessions_general: '',
            number_sessions_1_form: '',
            number_sessions_2_4_form: '',
            number_sessions_5_20_form: '',
            delete_confirm: '⚠ Tak, usuń',
            action_cancel: 'Nie, nie usuwaj',
            open_number_sessions: 'Are you sure you want to open $N selected sessions?',
            open_number_sessions_general: '',
            open_confirm: '⚠ Yes, open',
            time_created_label: 'Utworzono <time></time>',
            today_label: 'today',
            open_in_new_window_button: 'Otwórz w nowym oknie',
            open_in_current_window_button: 'Otwórz w obecnym oknie',
            private_windows_not_saved_label: 'Private window(s) not saved',
            private_windows_only_label: 'Private window(s) only',
            tabs_label: 'Tabs: ',
            windows_label: 'windows: '
        }
    }[LANGUAGE];

    /*
     * Key is the ID of your advanced panel. This must be UNIQUE (across the whole vivaldi UI). If in doubt, append your name to ensure it is unique
     *     You can use this ID as a #selector in the advancedPanels.css file
     * title: String, self explanatory
     * url: String, a UNIQUE (amongst web panels) vivaldi:// url that points to a non-existent page. You must add this as a web panel
     * switch: String of HTML, this will be set as the html in the panel switch button. E.g. an SVG
     * initialHTML: String of HTML, this will be used to fill in the panel with a skeleton of HTML to use
     * module: () => {onInit, onActivate} All necessary javascript should be included here.
     *     onInit: () => void. This will be called AFTER the advanced panel DOM is added, but BEFORE onActivate is called.
     *     onActivate: () => void. This will be called each time the advanced panel is opened AND IMMEDIATELY AFTER onInit.
     */
    const CUSTOM_PANELS = {
        sessions_lonm: {
            title: l10n.title,
            url: "vivaldi://sessions",
            switch: `<span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="5 0 10 10">
                        <path d="M7 2h6v1h-6v-1zm0 2h6v1h-6v-1zm0 2h6v1h-6v-1z"></path>
                    </svg>
                </span>`,
            initialHTML: `
                <div class="add-session-group">
                    <h2>${l10n.new_session}</h2>
                    <input type="text" placeholder="${l10n.session_name_placeholder}" class="session-name">
                    <span class="add-session-checkboxes">
                        <label><input type="checkbox" class="all-windows"><span>${l10n.all_windows}</span><label> ‎</label></label>
                        <label><input type="checkbox" class="selected-tabs"><span>${l10n.only_selected}</span></label>
                    </span>
                    <span class="add-session-buttons">
                        <input type="button" class="add-session" value="${l10n.add_session_btn}"></input>
                        <input type="button" class="refresh-sessions" value="${l10n.refresh_sessions_btn}"></input>
                    </span>
                </div>
                <div class="saved-sessions">
                    <h2>${l10n.saved_sessions}</h2>
                </div>
                <div class="sortselector sortselector-compact">
                    <select class="sortselector-dropdown" title="${l10n.sort_title}" tabindex="-1">
                        <option value="visitTime">${l10n.sort_date}</option>
                        <option value="title">${l10n.sort_name}</option>
                    </select>
                    <button class="sortselector-button direction-descending" title="${l10n.sort_asc}" tabindex="-1">
                        <svg width="11" height="6" viewBox="0 0 11 6" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.5.133l.11-.11 4.456 4.456-1.498 1.497L5.5 2.91 2.432 5.976.934 4.48 5.39.022l.11.11z"></path>
                        </svg>
                    </button>
                    <button class="sortselector-button direction-ascending selected" title="${l10n.sort_desc}" tabindex="-1">
                        <svg width="11" height="6" viewBox="0 0 11 6" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.5.133l.11-.11 4.456 4.456-1.498 1.497L5.5 2.91 2.432 5.976.934 4.48 5.39.022l.11.11z"></path>
                        </svg>
                    </button>
                </div>
                <section class="saved-sessions-list">
                    <section class="sessionslist">
                        <ul>
                        </ul>
                    </section>
                </section>
                <div class="remarks">
                    <p><span style="font-weight: bold">${privateWindowsNotSavedDisplayedPostfix}</span>${l10n.private_windows_not_saved_label}</p>
                    <p><span style="font-weight: bold">${privateWindowsOnlyDisplayedPostfix}</span>${l10n.private_windows_only_label}</p>
                </div>
                <div class="modal-container" id="modal-container-del">
                    <div class="confirm" id="confirm-del">
                        <p>${l10n.delete_prompt}</p>
                        <button id="yes-del">${l10n.delete_confirm}</button>
                        <button id="no-del" id="no-del">${l10n.action_cancel}</button>
                    </div>
                </div>
                <div class="modal-container" id="modal-container-open-new">
                    <div class="confirm" id="confirm-open-new">
                        <p>${l10n.open_number_sessions}</p>
                        <button id="yes-open-new">${l10n.open_confirm}</button>
                        <button id="no-open-new">${l10n.action_cancel}</button>
                    </div>
                </div>
                <div class="modal-container" id="modal-container-open-current">
                    <div class="confirm" id="confirm-open-current">
                        <p>${l10n.open_number_sessions}</p>
                        <button id="yes-open-current">${l10n.open_confirm}</button>
                        <button id="no-open-current">${l10n.action_cancel}</button>
                    </div>
                </div>
                <template class="session-item">
                    <li>
                        <div>
                            <h3></h3>
                            <span>${l10n.time_created_label}</span>
                        </div>
                        <button class="open-new" title="${l10n.open_in_new_window_button}">
                            <svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 6h-16v14h16v-14zm-11 2h2v2h-2v-2zm-3 0h2v2h-2v-2zm12 10h-12v-7h12v7zm0-8h-6v-2h6v2z"></path>
                            </svg>
                        </button>
                        <button class="open-current" title="${l10n.open_in_current_window_button}">
                            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 9h16v2h-16v-2zm0-4h8v4h-8v-4z"></path>
                            <path opacity=".5" d="M9 5h7v3h-7z"></path>
                            </svg>
                        </button>
                        <button class="delete" title="${l10n.delete_button}">
                            <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.2.5l-.7-.7L5 4.3.5-.2l-.7.7L4.3 5-.2 9.5l.7.7L5 5.7l4.5 4.5.7-.7L5.7 5"></path>
                            </svg>
                        </button>
                    </li>
                </template>`,
            module: function(){
                /*
                 * Returns if rightest decimal digit is 0 or 1-4 or 5-20 (21-24 is treated as 1-4,
                 * 25-30 as 5-20, 31-34 as 1-4, 35-40 as 5-20, etc). Useful for Slavic languages only
                 * @returns string from string array 'ends' (which must contain 3 strings)
                 */
                function getNumWithEnding(num, form_1, form_2_4, form_5_20){
                    if(
                        num % 100 >= 11
                        &&
                        num % 100 <= 19
                    ){
                        return '' + num + ' ' + form_5_20;
                    } else {
                        switch (num % 10){
                            case (1): return '' + num + ' ' + form_1;
                            case (2):
                            case (3):
                            case (4): return '' + num + ' ' + form_2_4;
                            default: return '' + num + ' ' + form_5_20;
                        }
                    }
                }

                /*
                 * Get selected session names
                 * @returns string array of names
                 */
                function getSelectedSessionNames(){
                    selectedSessions = Array.from(document.querySelectorAll("#sessions_lonm li.selected"));

                    return selectedSessions.map(x => x.getAttribute("data-session-name"));
                }

                /*
                 * Check if the target of a click is a button
                 * @param target an event target
                 */
                function isButton(target){
                    const tag = target.tagName.toLowerCase();
                    return (tag === "button" && target.className === "delete") || (tag === "svg" && target.parentElement.className === "delete") || (tag === "button" && target.className === "open-new") || (tag === "svg" && target.parentElement.className === "open-new") || (tag === "button" && target.className === "open-current") || (tag === "svg" && target.parentElement.className === "open-current");
                }

                /*
                 * Open a session after its corresponding list item is clicked
                 * @param e click event
                 * REMARK: Hide the confirm box if it is open
                 * REMARK: If click was on a button, just ignore it
                 */
                function listItemClick(e){
                    if(isButton(e.target)){
                        return;
                    }

                    if(e.altKey){
                        const itemList = document.querySelectorAll("#sessions_lonm li");

                        itemList.forEach(item => item.classList.add("selected"));
                    } else if(e.shiftKey){
                        let firstItem = null;
                        let lastItem = null;
                        const currentItem = e.currentTarget;

                        const itemList = document.querySelectorAll("#sessions_lonm li");
                        itemList.forEach(item => {
                            if(firstItem == null && (item == currentItem || item.classList.contains("selected"))){
                                firstItem = item;
                            } else if(item == currentItem || item.classList.contains("selected")){
                                lastItem = item;
                            }
                        });

                        itemList.forEach(item => {
                            if(firstItem != null && firstItem != item){
                                item.classList.toggle("selected", false);
                            }
                            else if(firstItem == item){
                                item.classList.toggle("selected", true);
                                firstItem = null;
                            }
                            else if(firstItem == null && lastItem != null && lastItem != item){
                                item.classList.toggle("selected", true);
                            }
                            else if(firstItem == null && lastItem == item){
                                item.classList.toggle("selected", true);
                                lastItem = null;
                            }
                            else {
                                item.classList.toggle("selected", false);
                            }
                        });
                    } else if(e.ctrlKey){
                        e.currentTarget.classList.toggle("selected");
                    } else {
                        const oldselect = document.querySelectorAll("#sessions_lonm li.selected");
                        oldselect.forEach(item => item.classList.remove("selected"));
                        e.currentTarget.classList.add("selected");
                    }
                }

                /*
                 * Turns a date into a string that can be used in a file name
                 * Locale string seems to be the best at getting the correct time for any given timezone
                 * @param {Date} date object
                 */
                function dateToFileSafeString(date){
                    const badChars = /[\\/:\*\?"<>\|]/gi;
                    let escaped = date.toLocaleString().replace(/:/g, "`");
                    return escaped.replace(badChars, '.');
                }

                /*
                 * Add a new session
                 * @param e button click event
                 */
                function addSessionClick(e){
                    var name = document.querySelector('#sessions_lonm .add-session-group input.session-name').value;
                    const saveAllWindows = document.querySelector('#sessions_lonm .add-session-group input.all-windows').checked;
                    const saveSelectedTabs = document.querySelector('#sessions_lonm .add-session-group input.selected-tabs').checked;
                    const markedTabs = document.querySelectorAll(".tab.marked");

                    const nameDate = dateToFileSafeString(new Date());
                    if(oldNameDate == nameDate){ //Disable too frequent session saves
                        return;
                    }
                    oldNameDate = nameDate;

                    if(name === ""){
                        name = nameDate.substring(0, nameDate.length - 3); //Remove seconds from session name
                    }

                    const options = {
                        saveOnlyWindowId: saveAllWindows ? 0 : window.vivaldiWindowId
                    };

                    let selectedTabsCount = 0;
                    if(saveSelectedTabs && markedTabs && markedTabs.length > 0){
                        options.ids = Array.from(markedTabs).map(tab => Number(tab.id.replace("tab-", "")));
                        selectedTabsCount = markedTabs.length;
                    }

                    chrome.windows.getAll({
                        populate: true,
                        windowTypes: ["normal"]
                    }, openedWindows => {
                        let openedWindowsCount = openedWindows.length;
                        let openedTabsCount = 0;
                        let currentWindowTabsCount = 0;

                        let privateWindowsCount = 0;
                        let privateTabsCount = 0;

                        let currentWindowIsPrivate = false;
                        for(let i = 0; i < openedWindows.length; i++){
                            openedTabsCount += openedWindows[i].tabs.length;

                            if(openedWindows[i].id === window.vivaldiWindowId){
                                currentWindowTabsCount = openedWindows[i].tabs.length;
                            }

                            if(openedWindows[i].incognito){
                                privateWindowsCount++;
                                privateTabsCount += openedWindows[i].tabs.length;

                                if(openedWindows[i].id === window.vivaldiWindowId){
                                    currentWindowIsPrivate = true;
                                }
                            }
                        }

                        if(selectedTabsCount === 0){
                            if(currentWindowIsPrivate){
                                if(saveAllWindows && privateWindowsCount > 1){
                                    name += " [" + privateTabsCount + "@" + privateWindowsCount + "]" + privateWindowsOnlyFilenamePostfix;
                                } else {
                                    name += " [" + currentWindowTabsCount + "]" + privateWindowsOnlyFilenamePostfix;
                                }
                            } else {
                                if(saveAllWindows){
                                    if(privateWindowsCount === 0){
                                        if(openedWindowsCount > 1){
                                            name += " [" + openedTabsCount + "@" + openedWindowsCount + "]";
                                        } else {
                                            name += " [" + openedTabsCount + "]";
                                        }
                                    } else {
                                        if(openedWindowsCount - privateWindowsCount > 1){
                                            name += " [" + (openedTabsCount - privateTabsCount) + "@" + (openedWindowsCount - privateWindowsCount) + "]" + privateWindowsNotSavedFilenamePostfix;
                                        } else if(openedWindowsCount - privateWindowsCount > 0){
                                            name += " [" + (openedTabsCount - privateTabsCount) + "]" + privateWindowsNotSavedFilenamePostfix;
                                        } else {
                                            return;
                                        }
                                    }
                                } else {
                                    name += " [" + currentWindowTabsCount + "]";
                                }
                            }
                        } else {
                            name += " [" + selectedTabsCount + "]";
                        }

                        vivaldi.sessionsPrivate.saveOpenTabs(name, options, () => {
                            document.querySelector('#sessions_lonm .add-session-group input.session-name').value = "";
                            document.querySelector('#sessions_lonm .add-session-group input.all-windows').checked = false;
                            document.querySelector('#sessions_lonm .add-session-group input.selected-tabs').checked = false;
                            updateList();
                        });
                    });
                }

                /*
                 * Refresh session list
                 * @param e button click event
                 */
                function refreshSessionsClick(e){
                    updateList();
                }

                /*
                 * Change sort Order
                 * @param e click event
                 */
                function sortOrderChange(e){
                    document.querySelectorAll("#sessions_lonm .sortselector-button").forEach(el => {
                        el.classList.toggle("selected");
                    });
                    updateList();
                }

                /*
                 * Change sort Method
                 * @param e click event
                 */
                function sortMethodChange(e){
                    updateList();
                }

                /*
                 * Show the delete confirmation box with specified text
                 * @param msg string to use
                 */
                function confirmMessage(question, dialogClass){
                    document.querySelector("#confirm-" + dialogClass + " p").innerText = question;
                    document.querySelector("#modal-container-" + dialogClass).classList.add("show");
                }

                /*
                 * User clicked remove button
                 * @param e click event
                 */
                function deleteClick(e){
                    selectedSessions = getSelectedSessionNames();

                    if(selectedSessions.length === 1){
                        const delete_t = l10n.delete_prompt.replace('$T', '"' + selectedSessions[0] + '"');
                        confirmMessage(delete_t, "del");
                    } else {
                        let delete_n = '';

                        if(l10n.delete_number_sessions_general === ''){
                            delete_n = l10n.delete_number_sessions.replace('$N', selectedSessions.length);
                        } else {
                            const sessionsText = getNumWithEnding(selectedSessions.length, l10n.number_sessions_1_form, l10n.number_sessions_2_4_form, l10n.number_sessions_5_20_form);

                            delete_n = l10n.delete_number_sessions_general.replace('$N', sessionsText);
                        }

                        confirmMessage(delete_n, "del");
                    }
                }

                /*
                 * User confirmed remove
                 * @param e event
                 * REMARK: Want to remove all and only update UI after final removal
                 */
                function deleteConfirmClick(e){
                    document.querySelector("#modal-container-del").classList.remove("show");

                    for(let i = 0; i < selectedSessions.length - 1; i++){
                        vivaldi.sessionsPrivate.delete(selectedSessions[i],() => {});
                    }
                    vivaldi.sessionsPrivate.delete(selectedSessions[selectedSessions.length - 1], ( )=> {
                        updateList();
                    });
                }

                /*
                 * User cancelled remove
                 * @param e event
                 */
                function actionCancelClick(e){
                    document.querySelector("#modal-container-del").classList.remove("show");
                    document.querySelector("#modal-container-open-new").classList.remove("show");
                    document.querySelector("#modal-container-open-current").classList.remove("show");
                }

                function openSessions(newWindow){
                    selectedSessions.forEach(item => {
                        vivaldi.sessionsPrivate.open(
                            item,
                            {openInNewWindow: newWindow}
                        );
                    });
                }

                /*
                 * User clicked open (new) button
                 * @param e click event
                 */
                function openInNewWindowClick(e){
                    selectedSessions = getSelectedSessionNames();

                    if(selectedSessions.length === 1) {
                        openSessions(true);
                    } else {
                        let open_n = '';

                        if(l10n.open_number_sessions_general === '') {
                            open_n = l10n.open_number_sessions.replace('$N', selectedSessions.length);
                        } else {
                            const sessionsText = getNumWithEnding(selectedSessions.length, l10n.number_sessions_1_form, l10n.number_sessions_2_4_form, l10n.number_sessions_5_20_form);

                            open_n = l10n.open_number_sessions_general.replace('$N', sessionsText);
                        }

                        confirmMessage(open_n, "open-new");
                    }
                }

                function openInNewWindowConfirmClick(e){
                    document.querySelector("#modal-container-open-new").classList.remove("show");
                    openSessions(true);
                }

                /*
                 * User clicked open (current) button
                 * @param e click event
                 */
                function openInCurrentWindowClick(e){
                    selectedSessions = getSelectedSessionNames();

                    if(selectedSessions.length === 1){
                        openSessions(false);
                    } else {
                        let open_n = '';

                        if(l10n.open_number_sessions_general === '') {
                            open_n = l10n.open_number_sessions.replace('$N', selectedSessions.length);
                        } else {
                            const sessionsText = getNumWithEnding(selectedSessions.length, l10n.number_sessions_1_form, l10n.number_sessions_2_4_form, l10n.number_sessions_5_20_form);

                            open_n = l10n.open_number_sessions_general.replace('$N', sessionsText);
                        }

                        confirmMessage(open_n, "open-current");
                    }
                }

                function openInCurrentWindowConfirmClick(e){
                    document.querySelector("#modal-container-open-current").classList.remove("show");
                    openSessions(false);
                }

                /*
                 * Turn a date into a string to show underneath each session
                 * @param {Date} date
                 */
                function dateToString(date){
                    return date.toLocaleString();
                }

                /*
                 * Generate a list item for a session object
                 * @returns DOM list item
                 */
                function createListItem(session){
                    const template = document.querySelector("#sessions_lonm template.session-item");
                    const el = document.importNode(template.content, true);

                    let timedSessionName = session.name.replace(/`/g, ':');

                    const tabCount = timedSessionName.replace(/.*\s\[(\d+)@?\d*\].*$/, '$1');
                    let windowCount = ''; //Set to '0' to show window count if it is 0
                    let pattern = new RegExp(/.*\s\[\d+@\d+\].*$/);
                    if(pattern.test(timedSessionName)){
                        windowCount = timedSessionName.replace(/.*\s\[\d+@(\d+)\].*$/, '$1');
                    }

                    let friendlySessionName = timedSessionName.replace(/(.*)\s\[\d+@?\d*\]!?!?(.*)$/, '$1$2');
                    friendlySessionName += ' (' + l10n.tabs_label + tabCount;
                    if(windowCount != ''){
                        friendlySessionName += ', ' + l10n.windows_label + windowCount;
                    }

                    if(timedSessionName.substring(timedSessionName.length - privateWindowsOnlyFilenamePostfix.length) === privateWindowsOnlyFilenamePostfix) {
                        friendlySessionName = friendlySessionName + ', ' + l10n.private_windows_only_label.toLowerCase();
                        timedSessionName = timedSessionName.substring(0, timedSessionName.length - privateWindowsOnlyFilenamePostfix.length) + privateWindowsOnlyDisplayedPostfix;
                    } else if(timedSessionName.substring(timedSessionName.length - privateWindowsNotSavedFilenamePostfix.length) === privateWindowsNotSavedFilenamePostfix) {
                        friendlySessionName = friendlySessionName + ', ' + l10n.private_windows_not_saved_label.toLowerCase();
                        timedSessionName = timedSessionName.substring(0, timedSessionName.length - privateWindowsNotSavedFilenamePostfix.length) + privateWindowsNotSavedDisplayedPostfix;
                    }
                    friendlySessionName += ')';

                    const date = new Date(session.createDateJS);
                    const sessionDate = (new Date(session.createDateJS)).setHours(0,0,0,0);
                    const nowDate = (new Date()).setHours(0,0,0,0);
                    let dateIfToday = dateToString(date);
                    let sessionTime = '';
                    if(sessionDate == nowDate){
                        sessionTime = dateIfToday.replace(/^.*,\s(\d\d:\d\d:\d\d)/, '$1');
                        dateIfToday = l10n.today_label + ', ' + sessionTime;
                    }

                    el.querySelector("h3").innerText = timedSessionName;
                    el.querySelector("h3").setAttribute("title", friendlySessionName);
                    el.querySelector("time").innerText = dateIfToday;
                    el.querySelector("time").setAttribute("datetime", date.toISOString());
                    el.querySelector("li").addEventListener("click", listItemClick);
                    el.querySelector(".open-new").addEventListener("click", openInNewWindowClick);
                    el.querySelector(".open-current").addEventListener("click", openInCurrentWindowClick);
                    el.querySelector(".delete").addEventListener("click", deleteClick);
                    el.querySelector("li").setAttribute("data-session-name", session.name);

                    return el;
                }

                /*
                 * Sort the array of sessions
                 * @param sessions array of session objects - unsorted
                 * @returns sessions array of session objects - sorted
                 */
                function sortSessions(sessions){
                    const sortRule = document.querySelector("#sessions_lonm .sortselector-dropdown").value;
                    const sortDescending = document.querySelector("#sessions_lonm .direction-descending.selected");

                    if(sortRule === "visitTime" && sortDescending){
                        sessions.sort((a,b) => {return a.createDateJS - b.createDateJS;});
                    } else if (sortRule === "visitTime" && !sortDescending){
                        sessions.sort((a,b) => {return b.createDateJS - a.createDateJS;});
                    } else if (sortRule === "title" && sortDescending){
                        sessions.sort((a,b) => {return a.name.localeCompare(b.name);});
                    } else if (sortRule === "title" && !sortDescending){
                        sessions.sort((a,b) => {return b.name.localeCompare(a.name);});
                    }

                    return sessions;
                }

                /*
                 * Create the dom list for the sessions
                 * @param sessions The array of session objects (already sorted)
                 * @returns DOM list of session items
                 */
                function createList(sessions){
                    const newList = document.createElement("ul");
                    sessions.forEach((session, index) => {
                        const li = createListItem(session, index);
                        newList.appendChild(li);
                    });

                    return newList;
                }

                /*
                 * Get the array of sessions and recreate the list in the panel
                 */
                function updateList(){
                    const existingList = document.querySelector("#sessions_lonm .sessionslist ul");

                    if(existingList){
                        existingList.parentElement.removeChild(existingList);
                    }

                    vivaldi.sessionsPrivate.getAll(items => {
                        const sorted = sortSessions(items);
                        const newList = createList(sorted);
                        document.querySelector("#sessions_lonm .sessionslist").appendChild(newList);
                    });
                }

                /*
                 * Update the session listing on activation of panel
                 */
                function onActivate(){
                    updateList();
                }

                /*
                 * Add the sort listeners on creation of panel
                 */
                function onInit(){
                    document.querySelectorAll("#sessions_lonm .sortselector-button").forEach(el => {
                        el.addEventListener("click", sortOrderChange);
                    });
                    document.querySelector("#sessions_lonm .sortselector-dropdown").addEventListener("change", sortMethodChange);
                    document.querySelector("#sessions_lonm .add-session-group .add-session-buttons .add-session").addEventListener("click", addSessionClick);
                    document.querySelector("#sessions_lonm .add-session-group .add-session-buttons .refresh-sessions").addEventListener("click", refreshSessionsClick);
                    document.querySelector("#yes-del").addEventListener("click", deleteConfirmClick);
                    document.querySelector("#no-del").addEventListener("click", actionCancelClick);
                    document.querySelector("#yes-open-new").addEventListener("click", openInNewWindowConfirmClick);
                    document.querySelector("#no-open-new").addEventListener("click", actionCancelClick);
                    document.querySelector("#yes-open-current").addEventListener("click", openInCurrentWindowConfirmClick);
                    document.querySelector("#no-open-current").addEventListener("click", actionCancelClick);
                }

                return {
                    onInit: onInit,
                    onActivate: onActivate
                };
            }
        }
    };


    /*
     * Observe for changes to the UI, e.g. if panels are hidden by going in to fullscreen mode
     * This may require the panel buttons and panels to be re-converted
     * Also, observe panels container, if class changes to switcher, the webstack is removed
     */
    const UI_STATE_OBSERVER = new MutationObserver(records => {
        convertWebPanelButtonstoAdvancedPanelButtons();
        listenForNewPanelsAndConvertIfNecessary();
    });

    /*
     * Observe UI state changes
     */
    function observeUIState(){
        const classInit = {
            attributes: true,
            attributeFilter: ["class"]
        };
        UI_STATE_OBSERVER.observe(document.querySelector("#browser"), classInit);
        UI_STATE_OBSERVER.observe(document.querySelector("#panels-container"), classInit);
    }

    const PANEL_STACK_CREATION_OBSERVER = new MutationObserver((records, observer) => {
        observer.disconnect();
        listenForNewPanelsAndConvertIfNecessary();
    });


    /*
     * Start listening for new web panel stack children and convert any already open ones
     */
    function listenForNewPanelsAndConvertIfNecessary(){
        const panelStack = document.querySelector("#panels .webpanel-stack");
        if(panelStack){
            WEBPANEL_CREATE_OBSERVER.observe(panelStack, {childList: true});
            const currentlyOpen = document.querySelectorAll(".webpanel-stack .panel");
            currentlyOpen.forEach(convertWebPanelToAdvancedPanel);
        } else {
            const panels = document.querySelector("#panels");
            PANEL_STACK_CREATION_OBSERVER.observe(panels, {childList: true});
        }
    }

    /*
     * Observer that should check for child additions to web panel stack
     * When a new child is added (a web panel initialised), convert it appropriately
     */
    const WEBPANEL_CREATE_OBSERVER = new MutationObserver(records => {
        records.forEach(record => {
            record.addedNodes.forEach(convertWebPanelToAdvancedPanel);
        });
    });

    /*
     * Webview loaded a page. This means the src has been initially set.
     * @param e load event
     */
    function webviewLoaded(e){
        e.currentTarget.removeEventListener("contentload", webviewLoaded);
        convertWebPanelToAdvancedPanel(e.currentTarget.parentElement.parentElement);
    }

    /*
     * Attempt to convert a web panel to an advanced panel.
     * First check if the SRC matches a registered value.
     * If so, call the advanced Panel Created method
     * @param node DOM node representing the newly added web panel (child of .webpanel-stack)
     * REMARK: Webview.src can add a trailing "/" to URLs
     * REMARK: When initially created the webview may have no src,
     *     so we need to listen for the first src change
     */
    function convertWebPanelToAdvancedPanel(node){
        const addedWebview = node.querySelector("webview");
        if(!addedWebview){
            return;
        }
        if(!addedWebview.src){
            addedWebview.addEventListener("contentload", webviewLoaded);
            return;
        }
        for(const key in CUSTOM_PANELS){
            const panel = CUSTOM_PANELS[key];
            const expectedURL = panel.url;
            if(addedWebview.src.startsWith(expectedURL)){
                advancedPanelCreated(node, panel, key);
                break;
            }
        }
    }

    /*
     * Convert a web panel into an Advanced Panel™
     * @param node the dom node added under web panel stack
     * @param panel the panel object descriptor
     * @param panelId the identifier (key) for the panel
     * REMARK: Vivaldi can instantiate some new windows with an
     *    "empty" web panel containing nothing but the webview
     * REMARK: Can't simply call node.innerHTML as otherwise the
     *    vivaldi UI will crash when attempting to hide the panel
     * REMARK: Check that the panel isn't already an advanced panel
     *    before convert as this could be called after state change
     * REMARK: it may take a while for vivaldi to update the title of
     *    a panel, therefore after it is terminated, the title may
     *    change to aborted. Title changing should be briefly delayed
     */
    function advancedPanelCreated(node, panel, panelID){
        if(node.getAttribute("advancedPanel")){
            return;
        }
        node.setAttribute("advancedPanel", "true");
        node.querySelector("webview").terminate();
        const newHTML = document.createElement("div");
        newHTML.innerHTML = panel.initialHTML;
        node.appendChild(newHTML);
        node.id = panelID;
        panel.module().onInit();
        ADVANCED_PANEL_ACTIVATION.observe(node, {attributes: true, attributeFilter: ["class"]});
        if(node.querySelector("header.webpanel-header")){
            advancedPanelOpened(node);
            setTimeout(() => {updateAdvancedPanelTitle(node);}, 500);
        }
    }


    /*
     * Observe attributes of an advanced panel to see when it becomes active
     */
    const ADVANCED_PANEL_ACTIVATION = new MutationObserver(records => {
        records.forEach(record => {
            if(record.target.classList.contains("visible")){
                advancedPanelOpened(record.target);
            }
        });
    });

    /*
     * An advanced panel has been selected by the user and is now active
     * @param node DOM node of the advancedpanel activated
     */
    function advancedPanelOpened(node){
        updateAdvancedPanelTitle(node);
        const panel = CUSTOM_PANELS[node.id];
        panel.module().onActivate();
    }

    /*
     * Update the header title of a panel
     * @param node DOM node of the advancedpanel activated
     */
    function updateAdvancedPanelTitle(node){
        const panel = CUSTOM_PANELS[node.id];
        node.querySelector("header.webpanel-header h1").innerHTML = panel.title;
        node.querySelector("header.webpanel-header h1").title = panel.title;
    }



    /*
     * Go through each advanced panel descriptor and convert the associated button
     */
    function convertWebPanelButtonstoAdvancedPanelButtons(){
        for(const key in CUSTOM_PANELS){
            const panel = CUSTOM_PANELS[key];
            let switchBtn = document.querySelector(`#switch button[title~="${panel.url}"`);
            if(!switchBtn){
                switchBtn = document.querySelector(`#switch button[advancedPanelSwitch="${key}"`);
                if(!switchBtn){
                    console.warn(`Failed to find button for ${panel.title}`);
                    continue;
                }
            }
            convertSingleButton(switchBtn, panel, key);
        }
    }

    /*
     * Set the appropriate values to convert a regular web panel switch into an advanced one
     * @param switchBtn DOM node for the #switch button being converted
     * @param panel The Advanced panel object description
     * @param id string id of the panel
     * REMARK: Check that the button isn't already an advanced panel button
     *    before convert as this could be called after state change
     */
    function convertSingleButton(switchBtn, panel, id){
        if(switchBtn.getAttribute("advancedPanelSwitch")){
            return;
        }
        switchBtn.title = panel.title;
        switchBtn.innerHTML = panel.switch;
        switchBtn.setAttribute("advancedPanelSwitch", id);
    }


    /*
     * Observe web panel switches.
     * REMARK: When one is added or removed, all of the web panels are recreated
     */
    const WEB_SWITCH_OBSERVER = new MutationObserver(records => {
        convertWebPanelButtonstoAdvancedPanelButtons();
        listenForNewPanelsAndConvertIfNecessary();
    });

    /*
     * Start observing for additions or removals of web panel switches
     */
    function observePanelSwitchChildren(){
        const panelSwitch = document.querySelector("#switch");
        WEB_SWITCH_OBSERVER.observe(panelSwitch, {childList: true});
    }


    /*
     * Initialise the mod. Checking to make sure that the relevant panel element exists first.
     */
    function initMod(){
        if(document.querySelector("#panels .webpanel-stack")){
            observeUIState();
            observePanelSwitchChildren();
            convertWebPanelButtonstoAdvancedPanelButtons();
            listenForNewPanelsAndConvertIfNecessary();
        } else {
            setTimeout(initMod, 500);
        }
    }

    initMod();
})();
