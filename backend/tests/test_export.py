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
