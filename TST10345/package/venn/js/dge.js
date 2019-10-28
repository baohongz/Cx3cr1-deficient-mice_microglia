// Generated by CoffeeScript 1.7.1
(function() {
  var DGEVenn, Data, GeneTable, LimitMsg, Overlaps, SelectorTable, clickTab, csv_data, csv_file, fdrCol, g_fc_cutoff, g_fdr_cutoff, id_column, info_columns, is_number, is_signif, key_column, logFCcol, read_settings, setup_tabs, show_tour;

  if (window.venn_settings == null) {
    window.venn_settings = {};
  }

  key_column = null;

  id_column = null;

  fdrCol = null;

  logFCcol = null;

  info_columns = null;

  csv_file = null;

  csv_data = null;

  show_tour = null;

  g_fdr_cutoff = 0.05;

  g_fc_cutoff = 0;

  read_settings = function() {
    if (window.venn_settings == null) {
      window.venn_settings = {};
    }
    key_column = venn_settings.key_column || 'key';
    id_column = venn_settings.id_column || 'Feature';
    fdrCol = venn_settings.fdr_column || 'adj.P.Val';
    logFCcol = venn_settings.logFC_column || 'logFC';
    info_columns = venn_settings.info_columns || [id_column];
    csv_file = venn_settings.csv_file || 'data.csv';
    csv_data = venn_settings.csv_data;
    return show_tour = venn_settings.show_tour != null ? venn_settings.show_tour : true;
  };

  is_signif = function(item) {
    return !(item[fdrCol] > g_fdr_cutoff || Math.abs(item[logFCcol]) < g_fc_cutoff);
  };

  setup_tabs = function() {
    $('#overlaps .nav a').click(function(el) {
      return clickTab($(el.target).parent('li'));
    });
    return clickTab($('#overlaps li[data-target=venn]'));
  };

  clickTab = function(li) {
    var id;
    if ($(li).hasClass('disabled')) {
      return;
    }
    $('#overlaps .nav li').removeClass('active');
    li.addClass('active');
    id = li.attr('data-target');
    $('#overlaps #venn-table, #overlaps #venn').hide();
    return $('#overlaps #' + id).show();
  };

  is_number = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };

  Overlaps = (function() {
    function Overlaps(gene_table, data) {
      this.gene_table = gene_table;
      this.data = data;
      this.proportional = false;
    }

    Overlaps.prototype.get_selected = function() {
      var name, res, sel, sels, _i, _len;
      sels = $('.selected');
      res = [];
      for (_i = 0, _len = sels.length; _i < _len; _i++) {
        sel = sels[_i];
        name = $(sel).parent('li').attr('class');
        if ($(sel).hasClass('total')) {
          res.push({
            name: name,
            typ: '',
            func: function(row) {
              return is_signif(row);
            }
          });
        } else if ($(sel).hasClass('up')) {
          res.push({
            name: name,
            typ: 'Up : ',
            func: function(row) {
              return is_signif(row) && row[logFCcol] >= 0;
            }
          });
        } else if ($(sel).hasClass('down')) {
          res.push({
            name: name,
            typ: 'Down : ',
            func: function(row) {
              return is_signif(row) && row[logFCcol] < 0;
            }
          });
        }
      }
      return res;
    };

    Overlaps.prototype.proportional_venn = function(enabled) {
      this._reset_venn();
      this.proportional = enabled;
      return this.update_selected();
    };

    Overlaps.prototype._reset_venn = function() {
      this.last_names = null;
      return $('#overlaps svg').remove();
    };

    Overlaps.prototype._forRows = function(set, cb) {
      var id, key, row, rowSet, s, _i, _j, _len, _len1, _ref, _results;
      _ref = this.data.ids;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        id = _ref[_i];
        rowSet = this.data.get_data_for_id(id);
        key = "";
        for (_j = 0, _len1 = set.length; _j < _len1; _j++) {
          s = set[_j];
          row = rowSet[s.name];
          key += s.func(row) ? "1" : "0";
        }
        _results.push(cb(key, rowSet));
      }
      return _results;
    };

    Overlaps.prototype._int_to_key = function(size, i) {
      var reverseStr, toBinary;
      toBinary = function(n, x) {
        return ("00000" + x.toString(2)).substr(-n);
      };
      reverseStr = function(s) {
        return s.split('').reverse().join('');
      };
      return reverseStr(toBinary(size, i));
    };

    Overlaps.prototype._int_to_list = function(size, i) {
      var j, res, s, _i, _ref;
      s = this._int_to_key(size, i);
      res = [];
      for (j = _i = 0, _ref = s.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; j = 0 <= _ref ? ++_i : --_i) {
        if (s[j] === '1') {
          res.push(j);
        }
      }
      return res;
    };

    Overlaps.prototype._tick_or_cross = function(x) {
      return "<i class='glyphicon glyphicon-" + (x ? 'ok' : 'remove') + "'></i>";
    };

    Overlaps.prototype._mk_venn_table = function(set, counts) {
      var k, s, str, table, v, _fn, _i, _len;
      table = $('<table>');
      str = '<thead><tr>';
      for (_i = 0, _len = set.length; _i < _len; _i++) {
        s = set[_i];
        str += "<th><div class='rotate'>" + s['typ'] + s['name'] + "</div></th>";
      }
      str += "<th>Number</tr></thead>";
      table.html(str);
      _fn = (function(_this) {
        return function(k, v) {
          var tr, x, _j, _len1, _ref;
          tr = $('<tr>');
          _ref = k.split('');
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            x = _ref[_j];
            tr.append("<td class='ticks'>" + (_this._tick_or_cross(x === '1')));
          }
          tr.append("<td class='total'><a href='#'>" + v + "</a>");
          $(table).append(tr);
          return $('tr a:last', table).click(function() {
            return _this._secondary_table(k, set);
          });
        };
      })(this);
      for (k in counts) {
        v = counts[k];
        if (Number(k) === 0) {
          continue;
        }
        _fn(k, v);
      }
      $('#overlaps #venn-table').empty();
      return $('#overlaps #venn-table').append(table);
    };

    Overlaps.prototype._mk_venn_diagram = function(set, counts) {
      if (this.proportional) {
        return this._mk_venn_diagram_proportional(set, counts);
      } else {
        return this._mk_venn_diagram_fixed(set, counts);
      }
    };

    Overlaps.prototype._mk_venn_diagram_fixed = function(set, counts) {
      var i, n, s, venn, _fn, _fn1, _i, _j, _len, _ref;
      $('#overlaps svg').remove();
      if (set.length <= 4) {
        n = set.length;
        venn = {};
        _fn = (function(_this) {
          return function(i) {
            var str;
            str = _this._int_to_key(n, i);
            venn[i] = {
              str: counts[str] || 0
            };
            return venn[i]['click'] = function() {
              return _this._secondary_table(str, set);
            };
          };
        })(this);
        for (i = _i = 1, _ref = Math.pow(2, set.length) - 1; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
          _fn(i);
        }
        _fn1 = function(s, i) {
          return venn[1 << i]['lbl'] = s['typ'] + s['name'];
        };
        for (i = _j = 0, _len = set.length; _j < _len; i = ++_j) {
          s = set[i];
          _fn1(s, i);
        }
        return draw_venn(n, '#overlaps #venn', venn);
      }
    };

    Overlaps.prototype._mk_venn_diagram_proportional = function(set, counts) {
      var d, i, n, names, overlaps, sets, z, _fn, _i, _ref;
      n = set.length;
      d = {};
      sets = [];
      overlaps = [];
      z = {};
      _fn = (function(_this) {
        return function(i) {
          var j, k, lst, s, str, _j, _k, _l, _len, _len1, _len2, _results;
          str = _this._int_to_key(n, i);
          lst = _this._int_to_list(n, i);
          if (lst.length > 1) {
            for (_j = 0, _len = lst.length; _j < _len; _j++) {
              j = lst[_j];
              for (_k = 0, _len1 = lst.length; _k < _len1; _k++) {
                k = lst[_k];
                if (j < k) {
                  s = "" + j + "," + k;
                  z[s] || (z[s] = {
                    sets: [j, k],
                    size: 0
                  });
                  z[s].size += counts[str] || 0;
                }
              }
            }
          }
          _results = [];
          for (_l = 0, _len2 = lst.length; _l < _len2; _l++) {
            j = lst[_l];
            sets[j] || (sets[j] = {
              label: set[j]['typ'] + set[j]['name'],
              size: 0
            });
            _results.push(sets[j].size += counts[str] || 0);
          }
          return _results;
        };
      })(this);
      for (i = _i = 1, _ref = Math.pow(2, set.length) - 1; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        _fn(i);
      }
      overlaps = d3.values(z);
      sets = venn.venn(sets, overlaps);
      names = set.map(function(s) {
        return s.name;
      });
      if (("" + names) === ("" + this.last_names)) {
        venn.updateD3Diagram(d3.select("#overlaps #venn"), sets);
      } else {
        $('#overlaps svg').remove();
        venn.drawD3Diagram(d3.select("#overlaps #venn"), sets, 750, 400);
      }
      return this.last_names = names;
    };

    Overlaps.prototype.update_selected = function() {
      var counts, set;
      set = this.get_selected();
      if (set.length === 0) {
        return;
      }
      counts = {};
      this._forRows(set, function(key) {
        if (counts[key] == null) {
          counts[key] = 0;
        }
        return counts[key] += 1;
      });
      this._mk_venn_table(set, counts);
      this._mk_venn_diagram(set, counts);
      return $('#overlaps #venn #not-supported').toggle(!this.proportional && set.length > 4);
    };

    Overlaps.prototype._secondary_table = function(k, set) {
      var cols, css, desc, descStr, i, rows, s, signif, _i, _len;
      rows = [];
      this._forRows(set, function(key, rowSet) {
        var row, s, _i, _len;
        if (key === k) {
          row = [];
          for (_i = 0, _len = set.length; _i < _len; _i++) {
            s = set[_i];
            if (!row.id) {
              row.id = rowSet[s.name][id_column];
              info_columns.map(function(c) {
                return row[c] = rowSet[s.name][c];
              });
            }
// Baohong
            row.push(rowSet[s.name][logFCcol]);
            row.push(rowSet[s.name][fdrCol]);
          }
          return rows.push(row);
        }
      });
      desc = [];
      cols = info_columns.map((function(_this) {
        return function(c) {
          return _this.gene_table.mk_column(c, c, '');
        };
      })(this));
      i = 0;
      for (_i = 0, _len = set.length; _i < _len; _i++) {
        s = set[_i];
        signif = k[i] === '1';
        css = signif ? {} : {
          cssClass: 'nosig'
        };
// Baohong
        cols.push(this.gene_table.mk_column(i, "logFC - " + s['name'], 'logFC', css));
		i += 1;
        cols.push(this.gene_table.mk_column(i, "adj.P.Val - " + s['name'], 'adj.P.Val', css));
        desc.push(this._tick_or_cross(signif) + s['typ'] + s['name']);
        i += 1;
      }
      descStr = "<ul class='list-unstyled'>" + desc.map(function(s) {
        return "<li>" + s;
      }).join('') + "</ul>";
      this.gene_table.set_name_and_desc("", descStr);
      return this.gene_table.set_data(rows, cols);
    };

    return Overlaps;

  })();

  LimitMsg = (function() {
    function LimitMsg() {
      this.count = {};
      this.max = 10;
    }

    LimitMsg.prototype.more = function(tag) {
      return (this.count[tag] == null) || (this.count[tag] < this.max);
    };

    LimitMsg.prototype.add = function(tag) {
      var _base;
      (_base = this.count)[tag] || (_base[tag] = 0);
      return this.count[tag] += 1;
    };

    LimitMsg.prototype.check_and_add = function(tag) {
      var m;
      m = this.more(tag);
      this.add(tag);
      return m;
    };

    return LimitMsg;

  })();

  Data = (function() {
    function Data(rows) {
      var all_keys, c, d, defined_columns, id, ids, k2, key, limit_msg, num_col, r, _, _base, _i, _j, _k, _l, _len, _len1, _len2, _len3, _name, _ref, _ref1;
      this.data = {};
      limit_msg = new LimitMsg();
      ids = {};
      defined_columns = [key_column, id_column, fdrCol, logFCcol].concat(info_columns);
      all_keys = {};
      for (_i = 0, _len = rows.length; _i < _len; _i++) {
        r = rows[_i];
        if (r[key_column] == null) {
          continue;
        }
        if (!r[id_column]) {
          if (limit_msg.check_and_add(id_column)) {
            log_error("No column (" + id_column + ") in row : ", r);
          }
          continue;
        }
        for (_j = 0, _len1 = defined_columns.length; _j < _len1; _j++) {
          c = defined_columns[_j];
          if ((r[c] == null) && limit_msg.check_and_add(c)) {
            log_error("Missing data for column : " + c);
          }
        }
        d = ((_base = this.data)[_name = r[id_column]] != null ? _base[_name] : _base[_name] = {});
        if (r.id == null) {
          r.id = r[id_column];
        }
        _ref = [fdrCol, logFCcol];
        for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
          num_col = _ref[_k];
          if (!is_number(r[num_col])) {
            if (limit_msg.check_and_add(num_col)) {
              log_error("Not numeric '" + r[num_col] + "' for row : " + r[id_column]);
            }
            r[num_col] = num_col === fdrCol ? 1.0 : NaN;
          } else {
            r[num_col] = parseFloat(r[num_col]);
          }
        }
        key = r[key_column];
        all_keys[key] = 1;
        d[key] = r;
        if (ids[key] == null) {
          ids[key] = {};
        }
        if (ids[key][r.id] && limit_msg.check_and_add('duplicate')) {
          log_error("Duplicate ID for " + key + ", id=" + r.id);
        }
        ids[key][r.id] = 1;
      }
      _ref1 = this.data;
      for (id in _ref1) {
        d = _ref1[id];
        for (key in all_keys) {
          _ = all_keys[key];
          if (d[key] == null) {
            if (limit_msg.check_and_add('missing')) {
              log_error("Missing ID for " + key + ", id=" + id);
            }
            d[key] = {
              id: id
            };
            d[key][fdrCol] = 1.0;
            d[key][logFCcol] = NaN;
            for (_l = 0, _len3 = info_columns.length; _l < _len3; _l++) {
              c = info_columns[_l];
              for (k2 in all_keys) {
                _ = all_keys[k2];
                if ((d[k2] != null) && (d[k2][c] != null)) {
                  d[key][c] = d[k2][c];
                }
              }
            }
          }
        }
      }
      this.ids = d3.keys(this.data);
      this.keys = d3.keys(this.data[this.ids[0]]);
    }

    Data.prototype.get_data_for_key = function(key) {
      return this.ids.map((function(_this) {
        return function(id) {
          return _this.data[id][key];
        };
      })(this));
    };

    Data.prototype.get_data_for_id = function(id) {
      return this.data[id];
    };

    Data.prototype.num_fdr = function(key) {
      var d, down, id, num, up, _ref;
      num = 0;
      up = 0;
      down = 0;
      _ref = this.data;
      for (id in _ref) {
        d = _ref[id];
        if (is_signif(d[key])) {
          num += 1;
          if (d[key][logFCcol] > 0) {
            up++;
          } else {
            down++;
          }
        }
      }
      return {
        'num': num,
        'up': up,
        'down': down
      };
    };

    return Data;

  })();

  GeneTable = (function() {
    function GeneTable(opts) {
      var grid_options;
      this.opts = opts;
      this._init_download_link();
      grid_options = {
        enableCellNavigation: true,
        enableColumnReorder: false,
        multiColumnSort: false,
        forceFitColumns: false,
        enableTextSelectionOnCells: true
      };
      this.dataView = new Slick.Data.DataView();
      this.grid = new Slick.Grid(this.opts.elem, this.dataView, [], grid_options);
      this.dataView.onRowCountChanged.subscribe((function(_this) {
        return function(e, args) {
          _this.grid.updateRowCount();
          _this.grid.render();
          return _this._update_info();
        };
      })(this));
      this.dataView.onRowsChanged.subscribe((function(_this) {
        return function(e, args) {
          _this.grid.invalidateRows(args.rows);
          return _this.grid.render();
        };
      })(this));
      this.grid.onSort.subscribe((function(_this) {
        return function(e, args) {
          return _this._sorter(args);
        };
      })(this));
      this.grid.onViewportChanged.subscribe((function(_this) {
        return function(e, args) {
          return _this._update_info();
        };
      })(this));
      if (this.opts.mouseover) {
        this.grid.onMouseEnter.subscribe((function(_this) {
          return function(e, args) {
            var d, i;
            i = _this.grid.getCellFromEvent(e).row;
            d = _this.dataView.getItem(i);
            return _this.opts.mouseover(d);
          };
        })(this));
      }
      if (this.opts.mouseout) {
        this.grid.onMouseLeave.subscribe((function(_this) {
          return function(e, args) {
            return _this.opts.mouseout();
          };
        })(this));
      }
      if (this.opts.dblclick) {
        this.grid.onDblClick.subscribe((function(_this) {
          return function(e, args) {
            return _this.opts.dblclick(_this.grid.getDataItem(args.row));
          };
        })(this));
      }

// Baohong Zhang

        this.grid.onClick.subscribe((function(_this) {
          return function(e, args) {
			var dgegene = _this.grid.getDataItem(args.row)["Feature"];
            console.log(dgegene);
			window.localStorage.setItem('dgegene',dgegene);
			window.localStorage.setItem('genename', _this.grid.getDataItem(args.row)["Gene Name"]);
          };
        })(this));

      this._setup_metadata_formatter((function(_this) {
        return function(ret) {
          return _this._meta_formatter(ret);
        };
      })(this));
    }

    GeneTable.prototype.set_name_and_desc = function(name, desc) {
      $('#gene-list-name').html(name);
      return $('#gene-list-desc').html(desc);
    };

    GeneTable.prototype._setup_metadata_formatter = function(formatter) {
      var row_metadata;
      row_metadata = function(old_metadata_provider) {
        return function(row) {
          var item, ret;
          item = this.getItem(row);
          ret = old_metadata_provider(row);
          return formatter(item, ret);
        };
      };
      return this.dataView.getItemMetadata = row_metadata(this.dataView.getItemMetadata);
    };

    GeneTable.prototype._meta_formatter = function(item, ret) {
      if (ret == null) {
        ret = {};
      }
      if (ret.cssClasses == null) {
        ret.cssClasses = '';
      }
      ret.cssClasses += is_signif(item) ? 'sig' : 'nosig';
      return ret;
    };

    GeneTable.prototype._get_formatter = function(type, val) {
      var cl;
      switch (type) {
        case 'logFC':
          cl = val >= 0 ? "pos" : "neg";
          return "<div class='" + cl + "'>" + (val.toFixed(2)) + "</div>";
        case 'FDR':
          if (val < 0.01) {
            return val.toExponential(2);
          } else {
            return val.toFixed(2);
          }
          break;
        default:
          return val;
      }
    };

    GeneTable.prototype._get_sort_func = function(type, col) {
      var comparer;
      comparer = function(x, y) {
        if (x === y) {
          return 0;
        } else {
          if (x > y) {
            return 1;
          } else {
            return -1;
          }
        }
      };
      return function(r1, r2) {
        var r, x, y;
        r = 0;
        x = r1[col];
        y = r2[col];
        switch (type) {
          case 'logFC':
            return comparer(Math.abs(x), Math.abs(y));
          case 'FDR':
            return comparer(x, y);
          default:
            return comparer(x, y);
        }
      };
    };

    GeneTable.prototype.mk_column = function(fld, name, type, opts) {
      var o;
      if (opts == null) {
        opts = {};
      }
      o = {
        id: fld,
        field: fld,
        name: name,
        sortable: true,
        formatter: (function(_this) {
          return function(i, c, val, m, row) {
            return _this._get_formatter(type, val);
          };
        })(this),
        sortFunc: this._get_sort_func(type, fld)
      };
      return $.extend(o, opts);
    };

    GeneTable.prototype._sorter = function(args) {
      if (args.sortCol.sortFunc) {
        return this.dataView.sort(args.sortCol.sortFunc, args.sortAsc);
      } else {
        return console.log("No sort function for", args.sortCol);
      }
    };

    GeneTable.prototype._update_info = function() {
      var btm, view;
      view = this.grid.getViewport();
      btm = d3.min([view.bottom, this.dataView.getLength()]);
      return $(this.opts.elem_info).html("Showing " + view.top + ".." + btm + " of " + (this.dataView.getLength()));
    };

    GeneTable.prototype.refresh = function() {
      return this.grid.invalidate();
    };

    GeneTable.prototype.set_data = function(data, columns) {
      this.data = data;
      this.columns = columns;
      this.dataView.beginUpdate();
      this.grid.setColumns([]);
      this.dataView.setItems(this.data);
      this.dataView.reSort();
      this.dataView.endUpdate();
      return this.grid.setColumns(this.columns);
    };

    GeneTable.prototype._init_download_link = function() {
      return $('a#csv-download').on('click', (function(_this) {
        return function(e) {
          var cols, items, keys, rows;
          e.preventDefault();
          if (_this.data.length === 0) {
            return;
          }
          cols = _this.columns;
          items = _this.data;
          keys = cols.map(function(c) {
            return c.name;
          });
          rows = items.map(function(r) {
            return cols.map(function(c) {
              return r[c.id];
            });
          });
		
		  var blob = new Blob([d3.csv.format([keys].concat(rows))], {type: "text/csv;charset=utf-8"});
          return window.open(URL.createObjectURL(blob));
        };
      })(this));
    };

    return GeneTable;

  })();

  SelectorTable = (function() {
    var elem;

    elem = "#files";

    function SelectorTable(data) {
      this.data = data;
      this.gene_table = new GeneTable({
        elem: '#gene-table',
        elem_info: '#gene-table-info'
      });
      this.overlaps = new Overlaps(this.gene_table, this.data);
      this._mk_selector();
      this.set_all_counts();
      this._initial_selection();
    }

// Baohong: show all data sets
    SelectorTable.prototype._initial_selection = function() {
//      this.selected(this.data.keys[0]);

      var cols, css, desc, descStr, i, rows, s, signif;
      var id, key, row, rowSet, s, _i, _j, _len, _len1, _ref, _results;
	  var _names, name;

		
	  _names = this.data.keys;
      _ref = this.data.ids;
	  rows = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        id = _ref[_i];
        rowSet = this.data.get_data_for_id(id);
		row = [];
		for (_j = 0; _j < _names.length; _j++) {
			name = _names[_j];
			if (!row.id) {
				row.id = rowSet[name][id_column];
				info_columns.map(function(c) {
					return row[c] = rowSet[name][c];
				});
			}
			row.push(rowSet[name][logFCcol]);
			row.push(rowSet[name][fdrCol]);
		} 
//console.log(row);
		rows.push(row);
      }

      cols = info_columns.map((function(_this) {
        return function(c) {
          return _this.gene_table.mk_column(c, c, '');
        };
      })(this));
      i = 0;
      for (_i = 0, _len = _names.length; _i < _len; _i++) {
		name = _names[_i];
        cols.push(this.gene_table.mk_column(i, "logFC - " + name, 'logFC'));
		i += 1;
        cols.push(this.gene_table.mk_column(i, "adj.P.Val - " + name, 'adj.P.Val'));
        i += 1;
      }
      this.gene_table.set_data(rows, cols);

      $('.selectable.total').slice(0, 3).addClass('selected');
      return this.overlaps.update_selected();
    };

    SelectorTable.prototype._mk_selector = function() {
      var name, span, _fn, _i, _len, _ref;
      span = function(clazz) {
        return "<span class='selectable " + clazz + "'></span>";
      };
      _ref = this.data.keys;
      _fn = (function(_this) {
        return function(name) {
          var li;
          li = $(("<li class='" + name + "'><a class='file' href='#'>" + name + "</a>") + span("total") + span("up") + span("down"));
          $('a', li).click(function() {
            return _this.selected(name);
          });
          return $(elem).append(li);
        };
      })(this);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        _fn(name);
      }
      return $('.selectable').click((function(_this) {
        return function(el) {
          return _this._sel_span(el.target);
        };
      })(this));
    };

    SelectorTable.prototype.proportional_venn = function(enable) {
      return this.overlaps.proportional_venn(enable);
    };

    SelectorTable.prototype.selected = function(name) {
      var columns, rows;
//console.log(name);
      rows = this.data.get_data_for_key(name);
//console.log(rows);
      columns = info_columns.map((function(_this) {
        return function(c) {
          return _this.gene_table.mk_column(c, c, '');
        };
      })(this));
      columns.push(this.gene_table.mk_column(logFCcol, logFCcol, 'logFC'), this.gene_table.mk_column(fdrCol, fdrCol, 'FDR'));
      this.gene_table.set_data(rows, columns);
      return this.gene_table.set_name_and_desc("for '" + name + "'", "");
    };

    SelectorTable.prototype.set_all_counts = function() {
      $('li', elem).each((function(_this) {
        return function(i, e) {
          return _this.set_counts(e);
        };
      })(this));
      this.gene_table.refresh();
      return this.overlaps.update_selected();
    };

    SelectorTable.prototype.set_counts = function(li) {
      var name, nums;
      name = $(li).attr('class');
      nums = this.data.num_fdr(name);
      $(".total", li).text(nums['num']);
      $(".up", li).html(nums['up'] + "&uarr;");
      return $(".down", li).html(nums['down'] + "&darr;");
    };

    SelectorTable.prototype._sel_span = function(item) {
      if ($(item).hasClass('selected')) {
        $(item).removeClass('selected');
      } else {
        $(item).siblings('span').removeClass('selected');
        $(item).addClass('selected');
      }
      this.overlaps.update_selected();
      return false;
    };

    return SelectorTable;

  })();

  DGEVenn = (function() {
    function DGEVenn() {
      read_settings();
      if (csv_data) {
        this._data_ready(d3.csv.parse(venn_settings.csv_data));
      } else {
        d3.csv(csv_file, (function(_this) {
          return function(rows) {
            return _this._data_ready(rows);
          };
        })(this));
      }
    }

    DGEVenn.prototype._show_page = function() {
      var about, body;
//      about = $(require("./templates/about.hbs")({
//        vennt_version: vennt_version
//      }));
//      body = $(require("./templates/body.hbs")());
//      $('body').append(body);
//      $('#about-modal').replaceWith(about);
      $('#wrap > .container').show();
      $('#loading').hide();
      setup_tabs();
      $("input.fdr-fld").value = g_fdr_cutoff;
      $("a.log-link").click(function() {
        return $('.log-list').toggle();
      });
      return setup_tour(show_tour);
    };

    DGEVenn.prototype._data_ready = function(rows) {
      var data;
      this._show_page();
      if (!rows) {
        log_error("Unable to download csv file : '" + csv_file + "'");
        return;
      }
      log_info("Downloaded data : " + rows.length + " rows");
      data = new Data(rows);
      this.selector = new SelectorTable(data);
      this._setup_sliders();
      $(".proportional input").change((function(_this) {
        return function(e) {
          return _this.selector.proportional_venn(e.target.checked);
        };
      })(this));
      return log_info("Ready!");
    };

    DGEVenn.prototype._setup_sliders = function() {
      var fcStepValues, fc_field, fdrStepValues, fdr_field;
      fdr_field = "input.fdr-fld";
      fdrStepValues = [0, 1e-5, 0.0001, 0.001, .01, .02, .03, .04, .05, 0.1, 1];
      this.fdr_slider = new Slider("#fdrSlider", fdr_field, fdrStepValues, (function(_this) {
        return function(v) {
          return _this.set_fdr_cutoff(v);
        };
      })(this));
      this.fdr_slider.set_slider(g_fdr_cutoff);
      $(fdr_field).keyup((function(_this) {
        return function(ev) {
          var el, v;
          el = ev.target;
          v = Number($(el).val());
          if (isNaN(v) || v < 0 || v > 1) {
            $(el).addClass('error');
          } else {
            $(el).removeClass('error');
          }
          return _this.set_fdr_cutoff(v);
        };
      })(this));
      fc_field = "input.fc-fld";
      fcStepValues = [0, 1, 2, 3, 4];
      this.fc_slider = new Slider("#fcSlider", fc_field, fcStepValues, (function(_this) {
        return function(v) {
          return _this.set_fc_cutoff(v);
        };
      })(this));
      this.fc_slider.set_slider(g_fc_cutoff);
      return $(fc_field).keyup((function(_this) {
        return function(ev) {
          var el, v;
          el = ev.target;
          v = Number($(el).val());
          if (isNaN(v) || v < 0) {
            $(el).addClass('error');
          } else {
            $(el).removeClass('error');
          }
          return _this.set_fc_cutoff(v);
        };
      })(this));
    };

    DGEVenn.prototype.set_fdr_cutoff = function(v) {
      g_fdr_cutoff = v;
      this.fdr_slider.set_slider(v);
      return this.selector.set_all_counts();
    };

    DGEVenn.prototype.set_fc_cutoff = function(v) {
      g_fc_cutoff = v;
      this.fc_slider.set_slider(v);
      return this.selector.set_all_counts();
    };

    return DGEVenn;

  })();

  $(document).ready(function() {
    return new DGEVenn();
  });

}).call(this);
