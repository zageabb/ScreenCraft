import pytest
from screencraft.package import starter_app, make_document, read_document, FormatError
from screencraft.export import interactive_html

def spreadsheet_node(**props):
    return {"id": "po-spreadsheet", "type": "x-spreadsheet", "parent_id": None,
            "props": {"label": "PO workbook", "engine": "univer", "mode": "read-only",
                      "workbook_ref": "purchase-orders", **props},
            "layout": {"x": 10, "y": 10, "width": 600, "height": 320},
            "bindings": {}}

def app_with(node):
    doc = starter_app()
    doc["screens"][0]["nodes"] = [node]
    return doc

def test_spreadsheet_round_trip_preserves_design_only_configuration():
    doc = app_with(spreadsheet_node(show_formula_bar=True, show_sheet_tabs=True))
    manifest, loaded, assets = read_document(make_document(doc))
    assert loaded == doc
    assert loaded["screens"][0]["nodes"][0]["props"]["workbook_ref"] == "purchase-orders"

def test_spreadsheet_export_contains_safe_local_preview_and_no_external_scripts():
    html = interactive_html(app_with(spreadsheet_node()))
    assert "function spreadsheetPreview(n)" in html
    assert "case 'x-spreadsheet':x=spreadsheetPreview(n)" in html
    assert "Offline design preview" in html
    assert "<script src=" not in html
    assert "Unsupported object: x-spreadsheet" not in html

@pytest.mark.parametrize("props", [
    {"engine": "some-remote-url"},
    {"workbook_ref": "https://example.org/steal"},
    {"workbook_ref": "../../secrets"},
    {"workbook_ref": "abc?token=123"},
    {"mode": "administrator"},
    {"allow_xlsx_import": "true"},
])
def test_reject_unsafe_spreadsheet_properties(props):
    with pytest.raises(FormatError):
        make_document(app_with(spreadsheet_node(**props)))
