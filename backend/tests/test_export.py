from screencraft.package import starter_app
from screencraft.export import interactive_html

def test_self_contained_interactive_export():
    app=starter_app()
    app["screens"].append({"id":"customers","name":"Customers","viewport":{"width":390,"height":700},
      "layout":{"mode":"flow","overflow_x":"auto","overflow_y":"auto"},
      "nodes":[{"id":"t","type":"table","parent_id":None,"props":{"dataset_id":"customer-seed"},"layout":{"overflow_x":"auto"}}]})
    app["screen_order"].append("customers")
    app["datasets"].append({"id":"customer-seed","columns":[{"id":"Name","type":"text"}],"rows":[{"Name":"Demo"}]})
    html=interactive_html(app,{"assets/test.png":b"\x89PNG\r\n\x1a\nabc"})
    assert 'id="sc-document"' in html and 'id="sc-assets"' in html
    assert html.index('id="sc-document"') < html.index("const app=JSON.parse")
    assert "data:image/png;base64," in html
    assert "add_mock_row" in html
    assert "https://" not in html and "<script src=" not in html

def test_dark_theme_export_resolves_tokens_and_styles():
    app=starter_app()
    app["default_theme"]="dark"
    app["themes"]["dark"]={"tokens":{
        "surface.page":"#101827",
        "surface.default":"#1E293B",
        "surface.nav":"#0B1220",
        "text.primary":"#F1F5F9",
        "text.secondary":"#94A3B8",
        "border.default":"#334155",
        "action.primary":"#60A5FA",
    }}
    app["screens"][0]["nodes"].append({
        "id":"theme-text","type":"text","parent_id":None,
        "props":{"text":"Readable in dark mode"},
        "layout":{"x":0,"y":0,"width":200,"height":50},
        "style":{"color_token":"text.primary","background_color_token":"surface.default"},
    })
    result=interactive_html(app)
    assert "function applyTheme()" in result
    assert "function applyNodeStyle(node,element)" in result
    assert "applyNodeStyle(n,x)" in result
    assert "--sc-page" in result and "--sc-field-text" in result
    assert ".sc-theme .sc-shared-nav" in result
    assert ".sc-theme .sc-kpi" in result
    assert ".sc-theme th" in result
    assert "root.classList.add('sc-theme')" in result
    assert "background_color_token" in result
    assert "#101827" in result and "#F1F5F9" in result

def test_interactive_html_supports_light_dark_palette_switch():
    app=starter_app()
    app["default_theme"]="dark"
    app["application_palette"]={"preset":"corporate"}
    app["themes"]["dark"]["tokens"]["action.primary"]="#E23B55"
    result=interactive_html(app)
    assert "Application theme" in result
    assert "picker.onchange=()=>{theme=picker.value;render()}" in result
    assert "action.on_primary" in result
    assert "#E23B55" in result
