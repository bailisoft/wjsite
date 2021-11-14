var lx = {};

lx.base = (function () {
	function getId(id, p) {
		return "string" == typeof id ? (p || document).getElementById(id) : id;
	};
	function getTag(tag, p) {
		return "string" == typeof tag ? (p || document).getElementsByTagName(tag) : tag;
	};
	function getClass(cls, p) {
		return "string" == typeof cls ? (p || document).getElementsByClassName(cls) : cls;
	};
	function select(exp, p) {
		return "string" == typeof exp ? (p || document).querySelectorAll(exp) : exp;
	};
	function newNode(tag) {
		return document.createElement(tag);
	}
	function newText(text) {
		return document.createTextNode(text);
	}

	function showPage(pageId) {
		var pages = document.body.children;
		for ( var i = 0, iLen = pages.length; i < iLen; ++i ) {
			pages[i].style.display = (pages[i].id == pageId) ? "block" : "none";
		}
		location.hash = pageId;
	}

	function popMsg(msg, withCloseButton) {
		var d = newNode("div");
		d.style.cssText = "position:fixed;width:100%;height:100%;top:0;left:0;background-color:rgba(0,0,0,.5);"
			+ "text-align:center;z-index:99999;";

		var p = newNode("p");
		p.innerHTML = msg;
		p.style.cssText = "position:absolute;max-width:75%;min-width:30%;border:3px solid #222;"
			+ "border-radius:12px;background-color:white;padding:2em 1em;cursor:default;";

		d.appendChild(p);
		document.body.appendChild(d);

		var xLeft = (d.clientWidth - p.offsetWidth) / 2,
			yTop = (d.clientHeight - p.offsetHeight) / 2;
		p.style.left = xLeft + "px";
		p.style.top = (yTop < 0) ? "5px" : yTop + "px";

		if (withCloseButton) {
			var c = newNode("div");
			c.style.cssText = "width:2rem;height:2rem;position:absolute;top:-1rem;left:-1rem;"
				+ "background-image:url(../res/delete-black.png);background-position:center;"
				+ "background-repeat:no-repeat;background-color:#fff;"
				+ "border:3px solid #222;border-radius:2rem;";
			p.appendChild(c);
			c.addEventListener("click", function () { d.parentNode.removeChild(d); }, false);
		}

		d.addEventListener("click", function () { d.parentNode.removeChild(d); }, false);
		p.addEventListener("click", function (e) { e.stopPropagation(); }, false);

		return p;
	};

	function _x() {
		if (typeof XMLHttpRequest !== 'undefined') {
			return new XMLHttpRequest();
		}
		var versions = [
			"MSXML2.XmlHttp.6.0",
			"MSXML2.XmlHttp.5.0",
			"MSXML2.XmlHttp.4.0",
			"MSXML2.XmlHttp.3.0",
			"MSXML2.XmlHttp.2.0",
			"Microsoft.XmlHttp"
		];

		var xhr;
		for (var i = 0; i < versions.length; i++) {
			try {
				xhr = new ActiveXObject(versions[i]);
				break;
			} catch (e) {
			}
		}
		return xhr;
	};

	function _send(method, url, data, cbSucc, cbFail, async) {
		if (async === undefined) {
			async = true;
		}
		var x = _x();
		x.open(method, url, async);
		x.onreadystatechange = function () {
			if (x.readyState == 4) {
				var stt = x.status;
				if (stt >= 200 && stt < 300) {
					cbSucc && cbSucc(x.responseText);
				} else {
					cbFail && cbFail("请检查网络。");
				}
			}
		};
		if (method == 'POST') {
			x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			x.send(data);
		} else {
			x.send(null);
		}
	};

	function get(url, data, cbSucc, cbFail, async) {
		var query = [];
		for (var key in data) {
			query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
		}
		_send("GET", url + (query.length ? '?' + query.join('&') : ''), null, cbSucc, cbFail, async)
	};

	function post(url, data, cbSucc, cbFail, async) {
		var query = [];
		for (var key in data) {
			query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
		}
		_send("POST", url, query.join('&'), cbSucc, cbFail, async)
	};

	return {
		getId: getId,
		getTag: getTag,
		getClass: getClass,
		select: select,
		newNode: newNode,
		newText: newText,
		showPage: showPage,
		popMsg: popMsg,
		get: get,
		post: post,
		testing: function(){return location.href.startsWith("file://");}
	};
}());

lx.goods = (function () {
	function _getDis(x1, y1, x2, y2) {
		var rv = Math.PI / 180;
		  var dLat = (y2-y1) * rv;
		  var dLon = (x2-x1) * rv;
		  var half =
			Math.sin(dLat /2) * Math.sin(dLat /2) +
			Math.cos(y1 * rv) * Math.cos(y2 * rv) *
			Math.sin(dLon /2) * Math.sin(dLon /2);
		  return 2 * Math.atan2(Math.sqrt(half), Math.sqrt(1-half)) * 6371;
	}

	function Good(com, x, y, code, sx, sy) {
		this.com = com;
		this.x = x;
		this.y = y;
		this.code = code;
		this.shop = "";
		this.addr = "";
		this.tele = "";
		this.resp = "";
		this.thumb = "gumbs/" + com.slice(0, 3) + "/" + com + "/" + code + ".jpg";
		this.image = "goods/" + com.slice(0, 3) + "/" + com + "/" + code + ".jpg";
 	 	this.dis = _getDis(x, y, sx, sy);
		this.duplicated = false;

		if (this.dis > 10) {
			this.distance = this.dis.toFixed(0) + "公里";
		} else if (this.dis > 1) {
			this.distance = this.dis.toFixed(1) + "公里";
		} else {
			this.distance = (1000 * this.dis).toFixed(0) + "米";
		}
	}

	Good.prototype.loadDetail = function() {
		//TODO...
	}

	return {
		Good: Good
	};
}());

lx.search = (function () {
    var base = lx.base;
    var Good = lx.goods.Good;

    var mTag = "";
    var mX = 0;
    var mY = 0;
    var mMores = 0;  
    var mFounds = {};

    function search(cb) {
        var url = (base.testing()) ? "https://www.aimeiwujia.com/web/search" : "/web/search";
        var prm = { 
			tag: mTag, 
			x: Math.round(mX * 1000000), 
			y: Math.round(mY * 1000000), 
			mores: mMores 
		};
		var founds = [];
		lx.widget.showLoading(rangeText());
		base.get(url, prm, function (data) {	
			lx.widget.hideLoading();
			var shops = data.split("\n");

			for (var i = 0, iLen = shops.length; i < iLen; ++i) {
				var parts = shops[i].split(",");
				if (parts.length == 4) {
					var goods = parts[3].split("\t");
					for (var j = 0, jLen = goods.length; j < jLen; ++j) {
						founds.push(new Good(parts[0], parts[1], parts[2], goods[j], mX, mY));
					}
				}
			}

			founds.sort(function (a, b) { return Math.round(1000 * a.dis - 1000 * b.dis); });

			for ( var i = 1, iLen = founds.length; i < iLen; ++i ) {
				for ( var k = 0; k < i; ++k ) {
					if ( founds[k].com == founds[i].com && founds[k].code == founds[i].code ) {
						founds[i].duplicated = true;
						break;
					}
				}
			}

			mFounds[mTag] = founds;

			lx.listPage.updateList();
		});
	}

	function getFounds(tag) {
		if ( tag ) {
			mTag = tag;
		}
		return mFounds[mTag];
	}

	function geoLocated(pos) {
		mX = pos.coords.longitude,
		mY = pos.coords.latitude;
		window.sessionStorage.setItem("x", mX);
		window.sessionStorage.setItem("y", mY);
		search();
	}

	function geoFailed(err) {
		switch (err.code) {
			case err.PERMISSION_DENIED:
				base.popMsg("定位功能未打开或未允许。");
				break;
			case err.POSITION_UNAVAILABLE:
				base.popMsg("定位无效。");
				break;
			case err.TIMEOUT:
				base.popMsg("定位超时。");
				break;
			case err.UNKNOWN_ERROR:
				base.popMsg("定位失败。");
				break;
		}
	}

    function searchNew(tag) {
        mTag = tag;
		mMores = 0;
		var sess = window.sessionStorage;
		mX = sess["x"];
        mY = sess["y"];
		if ( base.testing() ) {
			mX = 120.123456, mY = 30.123456;
		}
		if (mX && mY) {
			search();
		} else {
			var geo = window.navigator.geolocation;
			if (geo) {
				geo.getCurrentPosition(geoLocated, geoFailed);
			} else {
				alert("本站功能暂不支持老式浏览器。");
			}
		}
    }

    function searchMore() {
        mMores++;
		if ( mMores < 14 ) {
			search();
		}       
    }

	function rangeText() {
		if (mMores > 12) {
			return "全国";
		} else if (mMores > 11) {
			return "3000公里";
		}  else if (mMores > 10) {
			return "1500公里";
		}  else if (mMores > 9) {
			return "800公里";
		}  else if (mMores > 8) {
			return "500公里";
		}  else if (mMores > 7) {
			return "100公里";
		}  else if (mMores > 6) {
			return "80公里";
		}  else if (mMores > 5) {
			return "60公里";
		}  else if (mMores > 4) {
			return "40公里";
		}  else if (mMores > 3) {
			return "10公里";
		}  else if (mMores > 2) {
			return "5公里";
		}  else if (mMores > 1) {
			return "2公里";
		}  else if (mMores > 0) {
			return "1公里";
		}  else {
			return "几百米";
		} 
	}

	return {
        searchNew: searchNew,
        searchMore: searchMore,
		getFounds: getFounds,
		setTag: function(tag) {mTag=tag;},
		getTag: function() {return mTag;},
		getMores: function() {return mMores;}		
    };
}());

lx.listPage = (function(){
	var base = lx.base;
	var search = lx.search;

	function Card(good, index) {
		var logo = base.newNode("img");
		logo.src = good.thumb;
		logo.className = "img";
		logo.dataset.index = index;

		var mark = base.newNode("p");
		mark.appendChild(base.newText("距您" + good.distance));
		mark.className = "mark";

		var inner = base.newNode("div");
		inner.className = "item_inner"
		inner.appendChild(logo);
		inner.appendChild(mark);

		var me = base.newNode("div");
		me.className = "item";
		me.appendChild(inner);
		
		return me;
	}

	function updateList() {
		base.getId("隐藏同款货品").checked = false;
		base.getId("listHeaderText").textContent = lx.search.getTag();

		var founds = search.getFounds();
		var frag = document.createDocumentFragment();
		for (var i = 0, iLen = founds.length; i < iLen; ++i) {
			frag.appendChild(new Card(founds[i], i));
		}
		var clear = base.newNode("div");
		clear.className = "clear";
		frag.appendChild(clear);

		var list = base.getId("list");
		list.innerHTML = "";
		list.appendChild(frag);

		var summ = base.getId("listSum");
		summ.innerHTML = "<p>发现数量：" + founds.length + "</p>";

		base.showPage("listPage");
	}

	function filterDupp(input) {
		var shouldHide = input.checked;
		var list = base.getId("list");
		var founds = search.getFounds();
		for (var i = 0, iLen = list.children.length - 1; i < iLen; ++i ) { //without clear div
			list.children[i].style.display = (shouldHide && founds[i].duplicated) ? "none" : "block";
		}
	}

	return {
		updateList: updateList,
		filterDupp: filterDupp
	};
}());

lx.detailPage = (function(){
	var base = lx.base;

	function showDetail(index) {
		var good = lx.search.getFounds()[index];
        var url = (base.testing()) ? "https://www.aimeiwujia.com/web/shopinfo" : "/web/shopinfo";
        var prm = { 
			com: good.com, 
			x: Math.round(good.x * 1000000), 
			y: Math.round(good.y * 1000000)
		};
		lx.widget.showLoading();
		base.get(url, prm, function (data) {	
			lx.widget.hideLoading();

			var flds = data.split("\t");
			good.shop = flds[0]
			good.addr = flds[1]
			good.tele = flds[2]
			good.resp = flds[3]	

			var img = base.newNode("img");
			img.src = good.image;

			var shopk = base.newNode("div");
			shopk.appendChild(base.newText("店名："));
			shopk.className = "dtl_key";

			var addrk = base.newNode("div");
			addrk.appendChild(base.newText("地址："));
			addrk.className = "dtl_key";

			var telek = base.newNode("div");
			telek.appendChild(base.newText("电话："));
			telek.className = "dtl_key";

			var respk = base.newNode("div");
			respk.appendChild(base.newText("店长："));
			respk.className = "dtl_key";

			var shopv = base.newNode("div");
			shopv.appendChild(base.newText(good.shop));
			shopv.className = "dtl_value";

			var addrv = base.newNode("div");
			addrv.appendChild(base.newText(good.addr));
			addrv.className = "dtl_value";

			var telev = base.newNode("div");
			telev.appendChild(base.newText(good.tele));
			telev.className = "dtl_value";

			var respv = base.newNode("div");
			respv.appendChild(base.newText(good.resp));
			respv.className = "dtl_value";

			var tail = base.newNode("div");
			tail.appendChild(base.newText("就这些，喜欢就去看看吧。"));
			tail.className = "dtl_tail";

			var frag = document.createDocumentFragment();
			frag.appendChild(img);
			frag.appendChild(shopk);
			frag.appendChild(shopv);
			frag.appendChild(addrk);
			frag.appendChild(addrv);
			frag.appendChild(telek);
			frag.appendChild(telev);
			frag.appendChild(respk);
			frag.appendChild(respv);
			frag.appendChild(tail);

			var dtl = base.getId("dtl");
			dtl.innerHTML = "";
			dtl.appendChild(frag);

			base.showPage("dtlPage");
		});
	}

	return {
		showDetail: showDetail
	};
}());

lx.widget = (function(){
	var newNode = lx.base.newNode;

	var spinner = newNode("div");
	spinner.className = "waiting";

	var hint = newNode("div");
	hint.style.cssText = "color:#bbb; width:100%; text-align:center; font-size:2rem;";
	hint.innerHTML = "";

	var loading = newNode("div");
	loading.style.cssText = "width:100%; height:100%; position:fixed; top:0; left:0;"
		+ "background-color:white; z-index:99999; display:none;";

	loading.appendChild(spinner);
	loading.appendChild(hint);
	document.body.appendChild(loading);

	function showLoading(seekRange) {
		if (seekRange) {
			hint.innerHTML = "<p style='font-size:1rem;'>搜索半径</p><p>" + seekRange + "</p>";
		}
		spinner.className = (seekRange) ? "seeking" : "waiting";
		hint.style.display = (seekRange) ? "block" : "none";
		loading.style.display = "block";
	}

	function hideLoading() {
		loading.style.display = "none";
	}

	function newSwitch(text, checked, callback) {
		var base = lx.base;
		
		var input = base.newNode("input");
		input.setAttribute("type", "checkbox");
		input.id = text;
		input.checked = checked;
		input.className = "switch_input";
		input.onclick = function() { callback(input); };

		var title = base.newNode("span");
		title.appendChild(base.newText(text));
		title.className = "switch_title";

		var circle = base.newNode("span")
		circle.className = "switch_circle";

		var label = base.newNode("label");
		label.setAttribute("for", text);
		label.className = "switch_label";

		label.appendChild(title);
		label.appendChild(circle);
		
		var switchBox = base.newNode("div");
		switchBox.appendChild(input);
		switchBox.appendChild(label);

		var menuPage = base.getId("menuPage");
		var menuBar = base.getId("menuBar");
		if (!menuPage) {
			menuPage = newNode("div");
			menuPage.style.cssText = "width:100%; height:100%; position:fixed; top:0; left:0; "
				+ "background-color:rgba(0, 0, 0, 0.5); z-index:99999; display:none;";
			menuBar = newNode("div");
			menuBar.style.cssText = "width:50%; position:fixed; top:4rem; right:0; padding:1rem; "
				+ "background-color:white; border:1px solid #999; box-shadow: 1px 3px 5px rgba(0, 0, 0, 0.3); ";
			menuPage.appendChild(menuBar);
			document.body.appendChild(menuPage);
			base.getId("listHeaderMenu").onclick = function(){
				menuPage.style.display = "block";
			};
			menuPage.addEventListener("click", function () { menuPage.style.display = "none"; }, false);
			menuBar.addEventListener("click", function (e) { e.stopPropagation(); }, false);
		}

		menuBar.appendChild(switchBox);
	}

	return {
		showLoading: showLoading,
		hideLoading: hideLoading,
		newSwitch: newSwitch
	};
}());

(function () {
	var base = lx.base;
	var search = lx.search;

	base.getId("tags").addEventListener("click", function (e) {
		if (e.target.tagName == "LI") {
			var tag = e.target.textContent;
			var founds = search.getFounds(tag);
			if ( founds && founds.length > 0 ) {
				search.setTag(tag);
				lx.listPage.updateList();
			} else {
				search.searchNew(tag);
			}
		}
	});

	base.getId("list").addEventListener("click", function (e) {
		if (e.target.tagName == "IMG" ) {
			var index = e.target.dataset.index;
			lx.detailPage.showDetail(index);
		}
	});

	//Notice: Chinese Name is used as Object ID too.
	lx.widget.newSwitch("隐藏同款货品", false, lx.listPage.filterDupp);
	//others ... here.

	base.getId("listHeaderBack").onclick = function() {
		lx.base.showPage("homePage")
	}	

	base.getId("btnMore").onclick = function() {
		lx.search.searchMore();
	}

	base.getId("dtlHeaderBack").onclick = function() {
		lx.base.showPage("listPage")
	}

	base.showPage("homePage");

	onhashchange = function() {
		if ( !location.hash || location.hash.length < 2 ) return;
		var pageId = location.hash.slice(1);
		base.showPage(pageId);
	}

}());


