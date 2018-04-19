"use strict";

// n msec待つ
const sleep = n => new Promise(resolve => setTimeout(resolve, n));

// ローディングアイコンが消える＝読み込み終了とみなす
const isLoading = async () => {
  return !!document
    .getElementsByClassName("project-columns-container")[0]
    .querySelectorAll("include-fragment").length;
};

const waitLoading = async () => {
  const maxFetchCount = 100;
  let count = 0;

  // 読み込み終了or100回取得しても消えなかったら以上とみなして終了
  while ((await isLoading()) && count < maxFetchCount) {
    await sleep(100);
    count = count + 1;
  }
};

// プロジェクトの読み込みを雑に待つ
waitLoading().then(() => {
  // 画面上にあるカードのassigneeを取ってくる
  // [["hoge"], ["hoge", "fuga"], []...] のような状態になる
  let assignees = [];
  document.querySelectorAll("div[data-card-assignee]").forEach(i => {
    assignees = assignees.concat(JSON.parse(i.dataset.cardAssignee));
  });

  // 重複削除してソート
  assignees = Array.from(new Set(assignees)).sort();

  // プロジェクトカードの検索窓の横にセレクトボックスをつける
  let input = document.querySelector('input[name="card_filter_query"]');
  let select = document.createElement("select");
  select.classList = "form-control form-select";
  document.querySelector(".subnav-search").insertBefore(select, input);

  // 未選択用のoptionをselectに追加
  select.appendChild(document.createElement("option"));
  // assigneeをoptionとして入れる
  assignees.forEach(a => {
    let op = document.createElement("option");
    op.innerText = a;
    op.value = a;
    select.appendChild(op);
  });

  // 要素が選ばれたら、その要素の値をassgineeとして検索窓に入れ、検索させる
  select.onchange = function(selected) {
    let target = selected.target.options;
    let value = target[target.selectedIndex].value;
    let inputValue = "";
    if (value != "") inputValue = "assignee:" + value;
    let input = document.querySelector('input[name="card_filter_query"]');
    input.value = inputValue;

    // 検索窓に対してinputのイベントをdispatchすることで検索を発火させている
    // 手で検索窓の中身を置き換えた動きを擬似的に再現
    let inputEvent = new CustomEvent("input");
    document
      .querySelector('input[name="card_filter_query"]')
      .dispatchEvent(inputEvent);

    // Navigationが出るので消すために一回フォーカスを入れてから外す
    if (value == "") {
      input.focus();
      input.blur();
    }
  };
});
