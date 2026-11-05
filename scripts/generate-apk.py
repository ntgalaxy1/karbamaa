#!/usr/bin/env python3
import os
import sys
import shutil
import json
import struct
import zlib
import hashlib
import zipfile
import subprocess
import argparse
import base64


def get_package_version():
    try:
        with open("package.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("version", "10.0.0.27")
    except Exception:
        return "10.0.0.27"


def build_string_pool_utf16(strings):
    """Build a valid Android ResStringPool_header chunk in UTF-16LE format."""
    string_count = len(strings)
    encoded_strings = []
    offsets = []
    current_offset = 0

    for s in strings:
        offsets.append(current_offset)
        utf16_bytes = s.encode("utf-16le")
        char_len = len(s)
        entry = struct.pack("<H", char_len) + utf16_bytes + b"\x00\x00"
        encoded_strings.append(entry)
        current_offset += len(entry)

    strings_blob = b"".join(encoded_strings)
    while len(strings_blob) % 4 != 0:
        strings_blob += b"\x00"

    header_size = 28
    offsets_blob = struct.pack(f"<{string_count}I", *offsets)
    strings_start = header_size + len(offsets_blob)
    total_size = strings_start + len(strings_blob)

    header = struct.pack(
        "<HHI5I",
        0x0001,         # RES_STRING_POOL_TYPE
        header_size,    # 28
        total_size,
        string_count,
        0,              # styleCount
        0,              # flags (0 = UTF-16LE)
        strings_start,
        0               # stylesStart
    )
    return header + offsets_blob + strings_blob


def build_axml_manifest(package_name, version_code, version_name, app_name, is_proto=False):
    """
    Build a binary AndroidManifest.xml (AXML format) compliant with Android & Cafe Bazaar aapt2 parsers.
    """
    # Resource-mapped attribute names MUST come first, sorted by ascending Android Resource ID
    res_attr_defs = [
        ("label", 0x01010001),
        ("icon", 0x01010002),
        ("name", 0x01010003),
        ("exported", 0x01010010),
        ("configChanges", 0x0101001F),
        ("minSdkVersion", 0x0101020C),
        ("versionCode", 0x0101021B),
        ("versionName", 0x0101021C),
        ("targetSdkVersion", 0x01010270),
        ("allowBackup", 0x01010280),
        ("hardwareAccelerated", 0x010102D3),
        ("supportsRtl", 0x010103AF),
    ]

    strings = [name for name, _ in res_attr_defs]
    res_ids = [rid for _, rid in res_attr_defs]

    ANDROID_URI = "http://schemas.android.com/apk/res/android"
    extra_strings = [
        "android",
        ANDROID_URI,
        "manifest",
        "package",
        package_name,
        "uses-sdk",
        "uses-permission",
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "application",
        app_name,
        "activity",
        f"{package_name}.MainActivity",
        "intent-filter",
        "action",
        "android.intent.action.MAIN",
        "category",
        "android.intent.category.LAUNCHER",
        str(version_name),
        "@mipmap/ic_launcher",
        "",
    ]
    strings.extend(extra_strings)
    s_idx = {s: i for i, s in enumerate(strings)}
    NO_IDX = 0xFFFFFFFF

    string_pool_chunk = build_string_pool_utf16(strings)

    # Resource Map Chunk (0x0180)
    res_map_size = 8 + 4 * len(res_ids)
    res_map_chunk = struct.pack("<HHI", 0x0180, 8, res_map_size) + struct.pack(
        f"<{len(res_ids)}I", *res_ids
    )

    def make_start_ns(prefix_str, uri_str, line=2):
        return struct.pack(
            "<HHI2I2I",
            0x0100, 16, 24, line, NO_IDX,
            s_idx[prefix_str], s_idx[uri_str]
        )

    def make_end_ns(prefix_str, uri_str, line=40):
        return struct.pack(
            "<HHI2I2I",
            0x0101, 16, 24, line, NO_IDX,
            s_idx[prefix_str], s_idx[uri_str]
        )

    def attr_str(ns_str, name_str, val_str):
        uri = ANDROID_URI if ns_str == "android" else ns_str
        ns = s_idx[uri] if uri else NO_IDX
        name = s_idx[name_str]
        val = s_idx[val_str]
        # TYPE_STRING = 0x03
        return struct.pack("<3IHBBi", ns, name, val, 8, 0, 0x03, val)

    def attr_ref(ns_str, name_str, ref_id, raw_str=""):
        uri = ANDROID_URI if ns_str == "android" else ns_str
        ns = s_idx[uri] if uri else NO_IDX
        name = s_idx[name_str]
        val_idx = s_idx[raw_str] if raw_str and raw_str in s_idx else NO_IDX
        # TYPE_REFERENCE = 0x01
        return struct.pack("<3IHBBI", ns, name, val_idx, 8, 0, 0x01, ref_id & 0xFFFFFFFF)

    def attr_int(ns_str, name_str, val_int, hex_type=False):
        uri = ANDROID_URI if ns_str == "android" else ns_str
        ns = s_idx[uri] if uri else NO_IDX
        name = s_idx[name_str]
        dtype = 0x11 if hex_type else 0x10
        return struct.pack("<3IHBBI", ns, name, NO_IDX, 8, 0, dtype, val_int & 0xFFFFFFFF)

    def attr_bool(ns_str, name_str, val_bool):
        uri = ANDROID_URI if ns_str == "android" else ns_str
        ns = s_idx[uri] if uri else NO_IDX
        name = s_idx[name_str]
        v = 0xFFFFFFFF if val_bool else 0
        # TYPE_INT_BOOLEAN = 0x12
        return struct.pack("<3IHBBI", ns, name, NO_IDX, 8, 0, 0x12, v)

    def make_start_element(elem_name, attrs, line=3):
        attr_blob = b"".join(attrs)
        total_len = 16 + 20 + len(attr_blob)
        node_hdr = struct.pack("<HHI2I", 0x0102, 16, total_len, line, NO_IDX)
        ext_hdr = struct.pack(
            "<2I6H",
            NO_IDX,
            s_idx[elem_name],
            20,             # attributeStart
            20,             # attributeSize
            len(attrs),     # attributeCount
            0, 0, 0
        )
        return node_hdr + ext_hdr + attr_blob

    def make_end_element(elem_name, line=10):
        return struct.pack(
            "<HHI2I2I",
            0x0103, 16, 24, line, NO_IDX,
            NO_IDX, s_idx[elem_name]
        )

    chunks = [
        string_pool_chunk,
        res_map_chunk,
        make_start_ns("android", ANDROID_URI, 2),
        # <manifest> (resource-id attributes first in ascending order, then non-ns attributes)
        make_start_element(
            "manifest",
            [
                attr_int("android", "versionCode", int(version_code)),
                attr_str("android", "versionName", str(version_name)),
                attr_str(None, "package", package_name),
            ],
            2,
        ),
        # <uses-sdk>
        make_start_element(
            "uses-sdk",
            [
                attr_int("android", "minSdkVersion", 21),
                attr_int("android", "targetSdkVersion", 34),
            ],
            6,
        ),
        make_end_element("uses-sdk", 6),
        # <uses-permission INTERNET>
        make_start_element(
            "uses-permission",
            [attr_str("android", "name", "android.permission.INTERNET")],
            8,
        ),
        make_end_element("uses-permission", 8),
        # <uses-permission ACCESS_NETWORK_STATE>
        make_start_element(
            "uses-permission",
            [attr_str("android", "name", "android.permission.ACCESS_NETWORK_STATE")],
            9,
        ),
        make_end_element("uses-permission", 9),
        # <application>
        make_start_element(
            "application",
            [
                attr_str("android", "label", app_name),
                attr_ref("android", "icon", 0x7F010000, "@mipmap/ic_launcher"),
                attr_bool("android", "allowBackup", True),
                attr_bool("android", "hardwareAccelerated", True),
                attr_bool("android", "supportsRtl", True),
            ],
            11,
        ),
        # <activity>
        make_start_element(
            "activity",
            [
                attr_str("android", "label", app_name),
                attr_ref("android", "icon", 0x7F010000, "@mipmap/ic_launcher"),
                attr_str("android", "name", f"{package_name}.MainActivity"),
                attr_bool("android", "exported", True),
                attr_int("android", "configChanges", 0x04A0, hex_type=True),
            ],
            16,
        ),
        # <intent-filter>
        make_start_element("intent-filter", [], 21),
        make_start_element(
            "action",
            [attr_str("android", "name", "android.intent.action.MAIN")],
            22,
        ),
        make_end_element("action", 22),
        make_start_element(
            "category",
            [attr_str("android", "name", "android.intent.category.LAUNCHER")],
            23,
        ),
        make_end_element("category", 23),
        make_end_element("intent-filter", 24),
        make_end_element("activity", 25),
        make_end_element("application", 26),
        make_end_element("manifest", 27),
        make_end_ns("android", ANDROID_URI, 27),
    ]

    body = b"".join(chunks)
    total_size = 8 + len(body)
    file_header = struct.pack("<HHI", 0x0003, 8, total_size)
    return file_header + body


def build_minimal_resources_arsc(package_name, app_name):
    """
    Build a valid binary resources.arsc table (RES_TABLE_TYPE = 0x0002) with package ID 0x7f.
    Contains type 1 (mipmap) with entry 0 (ic_launcher) pointing to res/mipmap-hdpi-v4/ic_launcher.png,
    enabling Android Launchers to display the Karbama app logo.
    Must be stored uncompressed and 4-byte aligned in the APK.
    """
    global_strings_pool = build_string_pool_utf16([app_name, "res/mipmap-hdpi-v4/ic_launcher.png"])
    type_strings_pool = build_string_pool_utf16(["mipmap"])
    key_strings_pool = build_string_pool_utf16(["ic_launcher"])

    # 1. ResTable_typeSpec for type 1 (mipmap)
    ts_hdr = struct.pack("<HHI2BHI", 0x0202, 16, 20, 1, 0, 0, 1)
    ts_masks = struct.pack("<I", 0)
    type_spec_chunk = ts_hdr + ts_masks

    # 2. ResTable_type for type 1 (mipmap)
    config_blob = struct.pack("<I", 64) + b"\x00" * 60
    t_hdr_size = 84
    t_offsets = struct.pack("<I", 0)
    # ResTable_entry: size=8, flags=0, key=0 ("ic_launcher")
    # Res_value: size=8, res0=0, dataType=0x03 (TYPE_STRING), data=1 ("res/mipmap-hdpi-v4/ic_launcher.png")
    entry_blob = struct.pack("<2HI", 8, 0, 0) + struct.pack("<H2BI", 8, 0, 0x03, 1)
    t_total_size = t_hdr_size + len(t_offsets) + len(entry_blob)
    t_hdr = struct.pack("<HHI2BHI I", 0x0201, t_hdr_size, t_total_size, 1, 0, 0, 1, 88)
    type_chunk = t_hdr + config_blob + t_offsets + entry_blob

    types_blob = type_spec_chunk + type_chunk

    # Package chunk (0x0200)
    pkg_header_size = 288
    pkg_name_utf16 = package_name.encode("utf-16le")[:254]
    pkg_name_padded = pkg_name_utf16 + b"\x00" * (256 - len(pkg_name_utf16))

    type_strings_offset = pkg_header_size
    key_strings_offset = type_strings_offset + len(type_strings_pool)
    pkg_total_size = key_strings_offset + len(key_strings_pool) + len(types_blob)

    pkg_header = (
        struct.pack("<HHI", 0x0200, pkg_header_size, pkg_total_size)
        + struct.pack("<I", 0x7F)
        + pkg_name_padded
        + struct.pack(
            "<5I",
            type_strings_offset,
            1,  # lastPublicType (1 = mipmap)
            key_strings_offset,
            1,  # lastPublicKey (1 = ic_launcher)
            0,  # typeIdOffset
        )
    )
    pkg_chunk = pkg_header + type_strings_pool + key_strings_pool + types_blob

    table_header_size = 12
    table_total_size = table_header_size + len(global_strings_pool) + len(pkg_chunk)
    table_header = struct.pack("<HHII", 0x0002, table_header_size, table_total_size, 1)
    return table_header + global_strings_pool + pkg_chunk


def build_valid_dex(package_name):
    """
    Build a spec-compliant Dalvik Executable (classes.dex, version 035) containing
    MainActivity extending android.app.Activity with a full WebView in onCreate(Bundle)
    that loads file:///android_asset/www/index.html as a standalone Android application.
    """
    pkg_slash = package_name.replace(".", "/")

    raw_strings = sorted(
        [
            "<init>",
            "I",
            "L",
            "Landroid/app/Activity;",
            "Landroid/content/Context;",
            "Landroid/os/Bundle;",
            "Landroid/view/View;",
            "Landroid/webkit/WebChromeClient;",
            "Landroid/webkit/WebSettings;",
            "Landroid/webkit/WebView;",
            "Landroid/webkit/WebViewClient;",
            "Ljava/lang/String;",
            f"L{pkg_slash}/MainActivity;",
            "MainActivity.java",
            "V",
            "VL",
            "VZ",
            "Z",
            "ZI",
            "file:///android_asset/www/index.html",
            "getSettings",
            "loadUrl",
            "onCreate",
            "requestWindowFeature",
            "setAllowContentAccess",
            "setAllowFileAccess",
            "setContentView",
            "setDatabaseEnabled",
            "setDomStorageEnabled",
            "setJavaScriptEnabled",
            "setWebChromeClient",
            "setWebViewClient",
        ]
    )
    s_map = {s: i for i, s in enumerate(raw_strings)}

    type_descriptors = [
        "I",
        "Landroid/app/Activity;",
        "Landroid/content/Context;",
        "Landroid/os/Bundle;",
        "Landroid/view/View;",
        "Landroid/webkit/WebChromeClient;",
        "Landroid/webkit/WebSettings;",
        "Landroid/webkit/WebView;",
        "Landroid/webkit/WebViewClient;",
        "Ljava/lang/String;",
        f"L{pkg_slash}/MainActivity;",
        "V",
        "Z",
    ]
    type_descriptors.sort(key=lambda d: s_map[d])
    t_map = {d: i for i, d in enumerate(type_descriptors)}

    # Parameter type lists needed for 1-arg methods
    single_param_types = sorted(
        [
            "I",
            "Landroid/content/Context;",
            "Landroid/os/Bundle;",
            "Landroid/view/View;",
            "Landroid/webkit/WebChromeClient;",
            "Landroid/webkit/WebViewClient;",
            "Ljava/lang/String;",
            "Z",
        ],
        key=lambda d: t_map[d],
    )

    # Proto definitions: (shorty, return_type, param_tuple)
    proto_defs = [
        ("V", "V", ()),
        ("VL", "V", ("Landroid/content/Context;",)),
        ("VL", "V", ("Landroid/os/Bundle;",)),
        ("VL", "V", ("Landroid/view/View;",)),
        ("VL", "V", ("Landroid/webkit/WebChromeClient;",)),
        ("VL", "V", ("Landroid/webkit/WebViewClient;",)),
        ("VL", "V", ("Ljava/lang/String;",)),
        ("VZ", "V", ("Z",)),
        ("L", "Landroid/webkit/WebSettings;", ()),
        ("ZI", "Z", ("I",)),
    ]
    proto_defs.sort(
        key=lambda p: (t_map[p[1]], tuple(t_map[x] for x in p[2]))
    )
    p_map = {(p[1], p[2]): i for i, p in enumerate(proto_defs)}

    # Method definitions: (class_desc, method_name, (return_type, param_tuple))
    method_defs = [
        ("Landroid/app/Activity;", "<init>", ("V", ())),
        ("Landroid/app/Activity;", "onCreate", ("V", ("Landroid/os/Bundle;",))),
        ("Landroid/app/Activity;", "requestWindowFeature", ("Z", ("I",))),
        ("Landroid/app/Activity;", "setContentView", ("V", ("Landroid/view/View;",))),
        ("Landroid/webkit/WebChromeClient;", "<init>", ("V", ())),
        ("Landroid/webkit/WebSettings;", "setAllowContentAccess", ("V", ("Z",))),
        ("Landroid/webkit/WebSettings;", "setAllowFileAccess", ("V", ("Z",))),
        ("Landroid/webkit/WebSettings;", "setDatabaseEnabled", ("V", ("Z",))),
        ("Landroid/webkit/WebSettings;", "setDomStorageEnabled", ("V", ("Z",))),
        ("Landroid/webkit/WebSettings;", "setJavaScriptEnabled", ("V", ("Z",))),
        ("Landroid/webkit/WebView;", "<init>", ("V", ("Landroid/content/Context;",))),
        ("Landroid/webkit/WebView;", "getSettings", ("Landroid/webkit/WebSettings;", ())),
        ("Landroid/webkit/WebView;", "loadUrl", ("V", ("Ljava/lang/String;",))),
        ("Landroid/webkit/WebView;", "setWebChromeClient", ("V", ("Landroid/webkit/WebChromeClient;",))),
        ("Landroid/webkit/WebView;", "setWebViewClient", ("V", ("Landroid/webkit/WebViewClient;",))),
        ("Landroid/webkit/WebViewClient;", "<init>", ("V", ())),
        (f"L{pkg_slash}/MainActivity;", "<init>", ("V", ())),
        (f"L{pkg_slash}/MainActivity;", "onCreate", ("V", ("Landroid/os/Bundle;",))),
    ]
    method_defs.sort(
        key=lambda m: (t_map[m[0]], s_map[m[1]], p_map[m[2]])
    )
    m_map = {(m[0], m[1], m[2]): i for i, m in enumerate(method_defs)}

    # Calculate fixed section offsets
    header_off = 0x0000
    header_size = 0x0070
    string_ids_off = header_off + header_size
    string_ids_size = len(raw_strings) * 4
    type_ids_off = string_ids_off + string_ids_size
    type_ids_size = len(type_descriptors) * 4
    proto_ids_off = type_ids_off + type_ids_size
    proto_ids_size = len(proto_defs) * 12
    method_ids_off = proto_ids_off + proto_ids_size
    method_ids_size = len(method_defs) * 8
    class_defs_off = method_ids_off + method_ids_size
    class_defs_size = 32  # 1 class_def

    data_off = class_defs_off + class_defs_size
    cur = data_off

    # 1. type_list section (4-byte aligned)
    type_lists_off = cur
    param_type_off_map = {}
    type_list_blobs = []
    for pt in single_param_types:
        param_type_off_map[(pt,)] = cur
        blob = struct.pack("<IHH", 1, t_map[pt], 0)  # 8 bytes (4-byte aligned)
        type_list_blobs.append(blob)
        cur += len(blob)
    type_lists_section = b"".join(type_list_blobs)

    # 2. code_item section (4-byte aligned)
    code_init_off = cur
    m_Activity_init = m_map[("Landroid/app/Activity;", "<init>", ("V", ()))]
    init_insns = struct.pack("<HHHH", 0x1070, m_Activity_init, 0x0000, 0x000E)
    code_init_item = struct.pack("<4HII", 1, 1, 1, 0, 0, 4) + init_insns  # 24 bytes
    cur += len(code_init_item)

    code_oncreate_off = cur
    # Build instructions for MainActivity.onCreate(Bundle)
    oncreate_words = []
    # invoke-super {v4, v5}, Activity.onCreate(Bundle)
    oncreate_words.extend([0x206F, m_map[("Landroid/app/Activity;", "onCreate", ("V", ("Landroid/os/Bundle;",)))], 0x0054])
    # const/4 v2, 1
    oncreate_words.append(0x1212)
    # invoke-virtual {v4, v2}, Activity.requestWindowFeature(I)Z
    oncreate_words.extend([0x206E, m_map[("Landroid/app/Activity;", "requestWindowFeature", ("Z", ("I",)))], 0x0024])
    # new-instance v0, WebView
    oncreate_words.extend([0x0022, t_map["Landroid/webkit/WebView;"]])
    # invoke-direct {v0, v4}, WebView.<init>(Context)
    oncreate_words.extend([0x2070, m_map[("Landroid/webkit/WebView;", "<init>", ("V", ("Landroid/content/Context;",)))], 0x0040])
    # invoke-virtual {v0}, WebView.getSettings()
    oncreate_words.extend([0x106E, m_map[("Landroid/webkit/WebView;", "getSettings", ("Landroid/webkit/WebSettings;", ()))], 0x0000])
    # move-result-object v1
    oncreate_words.append(0x010C)
    # invoke-virtual {v1, v2}, WebSettings.setJavaScriptEnabled(true)
    oncreate_words.extend([0x206E, m_map[("Landroid/webkit/WebSettings;", "setJavaScriptEnabled", ("V", ("Z",)))], 0x0021])
    # invoke-virtual {v1, v2}, WebSettings.setDomStorageEnabled(true)
    oncreate_words.extend([0x206E, m_map[("Landroid/webkit/WebSettings;", "setDomStorageEnabled", ("V", ("Z",)))], 0x0021])
    # invoke-virtual {v1, v2}, WebSettings.setDatabaseEnabled(true)
    oncreate_words.extend([0x206E, m_map[("Landroid/webkit/WebSettings;", "setDatabaseEnabled", ("V", ("Z",)))], 0x0021])
    # invoke-virtual {v1, v2}, WebSettings.setAllowFileAccess(true)
    oncreate_words.extend([0x206E, m_map[("Landroid/webkit/WebSettings;", "setAllowFileAccess", ("V", ("Z",)))], 0x0021])
    # invoke-virtual {v1, v2}, WebSettings.setAllowContentAccess(true)
    oncreate_words.extend([0x206E, m_map[("Landroid/webkit/WebSettings;", "setAllowContentAccess", ("V", ("Z",)))], 0x0021])
    # new-instance v1, WebViewClient
    oncreate_words.extend([0x0122, t_map["Landroid/webkit/WebViewClient;"]])
    # invoke-direct {v1}, WebViewClient.<init>()
    oncreate_words.extend([0x1070, m_map[("Landroid/webkit/WebViewClient;", "<init>", ("V", ()))], 0x0001])
    # invoke-virtual {v0, v1}, WebView.setWebViewClient(WebViewClient)
    oncreate_words.extend([0x206E, m_map[("Landroid/webkit/WebView;", "setWebViewClient", ("V", ("Landroid/webkit/WebViewClient;",)))], 0x0010])
    # new-instance v1, WebChromeClient
    oncreate_words.extend([0x0122, t_map["Landroid/webkit/WebChromeClient;"]])
    # invoke-direct {v1}, WebChromeClient.<init>()
    oncreate_words.extend([0x1070, m_map[("Landroid/webkit/WebChromeClient;", "<init>", ("V", ()))], 0x0001])
    # invoke-virtual {v0, v1}, WebView.setWebChromeClient(WebChromeClient)
    oncreate_words.extend([0x206E, m_map[("Landroid/webkit/WebView;", "setWebChromeClient", ("V", ("Landroid/webkit/WebChromeClient;",)))], 0x0010])
    # invoke-virtual {v4, v0}, Activity.setContentView(View)
    oncreate_words.extend([0x206E, m_map[("Landroid/app/Activity;", "setContentView", ("V", ("Landroid/view/View;",)))], 0x0004])
    # const-string v3, "file:///android_asset/www/index.html"
    oncreate_words.extend([0x031A, s_map["file:///android_asset/www/index.html"]])
    # invoke-virtual {v0, v3}, WebView.loadUrl(String)
    oncreate_words.extend([0x206E, m_map[("Landroid/webkit/WebView;", "loadUrl", ("V", ("Ljava/lang/String;",)))], 0x0030])
    # return-void
    oncreate_words.append(0x000E)

    oncreate_insns = struct.pack(f"<{len(oncreate_words)}H", *oncreate_words)
    if len(oncreate_insns) % 4 != 0:
        oncreate_insns += b"\x00\x00"
    code_oncreate_item = (
        struct.pack("<4HII", 6, 2, 2, 0, 0, len(oncreate_words)) + oncreate_insns
    )
    cur += len(code_oncreate_item)

    def uleb128(val):
        out = bytearray()
        while True:
            b = val & 0x7F
            val >>= 7
            if val:
                out.append(b | 0x80)
            else:
                out.append(b)
                break
        return bytes(out)

    # 3. string_data_item section
    string_data_off = cur
    string_offsets = []
    string_data_blobs = []
    for s in raw_strings:
        string_offsets.append(cur)
        b_utf8 = s.encode("utf-8")
        item = uleb128(len(s)) + b_utf8 + b"\x00"
        string_data_blobs.append(item)
        cur += len(item)
    string_data_section = b"".join(string_data_blobs)

    # 4. class_data_item section
    class_data_off = cur
    m_Main_init = m_map[(f"L{pkg_slash}/MainActivity;", "<init>", ("V", ()))]
    m_Main_onCreate = m_map[(f"L{pkg_slash}/MainActivity;", "onCreate", ("V", ("Landroid/os/Bundle;",)))]

    class_data_item = (
        uleb128(0)  # static_fields_size
        + uleb128(0)  # instance_fields_size
        + uleb128(1)  # direct_methods_size
        + uleb128(1)  # virtual_methods_size
        # direct_method[0]: <init>()V (PUBLIC | CONSTRUCTOR = 0x10001)
        + uleb128(m_Main_init)
        + uleb128(0x10001)
        + uleb128(code_init_off)
        # virtual_method[0]: onCreate(Bundle)V (PUBLIC = 0x0001)
        + uleb128(m_Main_onCreate)
        + uleb128(0x0001)
        + uleb128(code_oncreate_off)
    )
    cur += len(class_data_item)
    pad_before_map = (4 - (cur % 4)) % 4
    cur += pad_before_map

    # 5. map_list section (4-byte aligned)
    map_off = cur
    map_items = [
        (0x0000, 0, 1, header_off),
        (0x0001, 0, len(raw_strings), string_ids_off),
        (0x0002, 0, len(type_descriptors), type_ids_off),
        (0x0003, 0, len(proto_defs), proto_ids_off),
        (0x0005, 0, len(method_defs), method_ids_off),
        (0x0006, 0, 1, class_defs_off),
        (0x1001, 0, len(single_param_types), type_lists_off),
        (0x2001, 0, 2, code_init_off),
        (0x2002, 0, len(raw_strings), string_data_off),
        (0x2000, 0, 1, class_data_off),
        (0x1000, 0, 1, map_off),
    ]
    map_blob = struct.pack("<I", len(map_items)) + b"".join(
        struct.pack("<HHII", t, u, sz, off) for t, u, sz, off in map_items
    )
    file_size = map_off + len(map_blob)
    data_size = file_size - data_off

    string_ids_blob = struct.pack(f"<{len(string_offsets)}I", *string_offsets)
    type_ids_blob = struct.pack(
        f"<{len(type_descriptors)}I", *[s_map[d] for d in type_descriptors]
    )
    proto_ids_blob = b"".join(
        struct.pack(
            "<3I",
            s_map[shorty],
            t_map[ret],
            param_type_off_map.get(params, 0),
        )
        for shorty, ret, params in proto_defs
    )
    method_ids_blob = b"".join(
        struct.pack("<HHI", t_map[c], p_map[p], s_map[n])
        for c, n, p in method_defs
    )
    class_def_blob = struct.pack(
        "<8I",
        t_map[f"L{pkg_slash}/MainActivity;"],
        0x0001,
        t_map["Landroid/app/Activity;"],
        0,
        s_map["MainActivity.java"],
        0,
        class_data_off,
        0,
    )

    header_without_hashes = struct.pack(
        "<20I",
        file_size,
        header_size,
        0x12345678,
        0,
        0,
        map_off,
        len(raw_strings),
        string_ids_off,
        len(type_descriptors),
        type_ids_off,
        len(proto_defs),
        proto_ids_off,
        0,
        0,
        len(method_defs),
        method_ids_off,
        1,
        class_defs_off,
        data_size,
        data_off,
    )

    body_after_header = (
        string_ids_blob
        + type_ids_blob
        + proto_ids_blob
        + method_ids_blob
        + class_def_blob
        + type_lists_section
        + code_init_item
        + code_oncreate_item
        + string_data_section
        + class_data_item
        + (b"\x00" * pad_before_map)
        + map_blob
    )

    dex_post_sig = header_without_hashes + body_after_header
    sha1_digest = hashlib.sha1(dex_post_sig).digest()
    dex_post_checksum = sha1_digest + dex_post_sig
    adler = zlib.adler32(dex_post_checksum) & 0xFFFFFFFF

    magic = b"dex\n035\x00"
    return magic + struct.pack("<I", adler) + dex_post_checksum


def ensure_signing_certificate(cert_dir="certs"):
    """Ensure a persistent RSA-2048 release key and X.509 certificate exist for signing APKs & AABs."""
    os.makedirs(cert_dir, exist_ok=True)
    key_path = os.path.join(cert_dir, "karbama-release.key")
    crt_path = os.path.join(cert_dir, "karbama-release.crt")
    der_path = os.path.join(cert_dir, "karbama-release.der")

    if not (os.path.exists(key_path) and os.path.exists(crt_path)):
        subprocess.run(
            [
                "openssl",
                "req",
                "-x509",
                "-nodes",
                "-newkey",
                "rsa:2048",
                "-keyout",
                key_path,
                "-out",
                crt_path,
                "-days",
                "10000",
                "-subj",
                "/C=TR/ST=Istanbul/L=Istanbul/O=Karbama/OU=Mobile/CN=app.karbama.twa",
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

    subprocess.run(
        ["openssl", "x509", "-in", crt_path, "-outform", "DER", "-out", der_path],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return key_path, crt_path, der_path


def generate_jar_signature_files(entries_dict, key_path, crt_path):
    """
    Create META-INF/MANIFEST.MF, META-INF/CERT.SF, and PKCS#7 DER META-INF/CERT.RSA
    for V1 JAR / AAB signing.
    """
    manifest_lines = [
        "Manifest-Version: 1.0",
        "Created-By: 1.0 (Android SignApk / Karbama Release Builder)",
        "",
    ]
    for name in sorted(entries_dict.keys()):
        if name.startswith("META-INF/"):
            continue
        digest_b64 = base64.b64encode(hashlib.sha256(entries_dict[name]).digest()).decode("ascii")
        manifest_lines.append(f"Name: {name}")
        manifest_lines.append(f"SHA-256-Digest: {digest_b64}")
        manifest_lines.append("")

    manifest_bytes = "\r\n".join(manifest_lines).encode("utf-8")
    main_digest_b64 = base64.b64encode(hashlib.sha256(manifest_bytes).digest()).decode("ascii")

    sf_lines = [
        "Signature-Version: 1.0",
        "Created-By: 1.0 (Android SignApk)",
        f"SHA-256-Digest-Manifest: {main_digest_b64}",
        "X-Android-APK-Signed: 2",
        "",
    ]

    for name in sorted(entries_dict.keys()):
        if name.startswith("META-INF/"):
            continue
        digest_b64 = base64.b64encode(hashlib.sha256(entries_dict[name]).digest()).decode("ascii")
        section_text = f"Name: {name}\r\nSHA-256-Digest: {digest_b64}\r\n\r\n".encode("utf-8")
        sec_digest_b64 = base64.b64encode(hashlib.sha256(section_text).digest()).decode("ascii")
        sf_lines.append(f"Name: {name}")
        sf_lines.append(f"SHA-256-Digest: {sec_digest_b64}")
        sf_lines.append("")

    sf_bytes = "\r\n".join(sf_lines).encode("utf-8")

    sf_tmp = "/tmp/karbama_cert.sf"
    rsa_tmp = "/tmp/karbama_cert.rsa"
    with open(sf_tmp, "wb") as f:
        f.write(sf_bytes)

    subprocess.run(
        [
            "openssl",
            "cms",
            "-sign",
            "-binary",
            "-noattr",
            "-in",
            sf_tmp,
            "-signer",
            crt_path,
            "-inkey",
            key_path,
            "-outform",
            "DER",
            "-out",
            rsa_tmp,
            "-md",
            "sha256",
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    with open(rsa_tmp, "rb") as f:
        rsa_bytes = f.read()

    return manifest_bytes, sf_bytes, rsa_bytes


def write_zipaligned_zip(zip_path, entries_dict, uncompressed_names=None):
    """
    Write a ZIP file where uncompressed entries (such as resources.arsc and PNGs)
    have their file data 4-byte aligned in the archive via the Local File Header extra field.
    """
    if uncompressed_names is None:
        uncompressed_names = set()

    with zipfile.ZipFile(zip_path, "w") as zf:
        for name in entries_dict.keys():
            data = entries_dict[name]
            is_stored = (
                name in uncompressed_names
                or name == "resources.arsc"
                or name.endswith(".png")
            )
            zinfo = zipfile.ZipInfo(filename=name, date_time=(2026, 1, 1, 0, 0, 0))
            zinfo.compress_type = zipfile.ZIP_STORED if is_stored else zipfile.ZIP_DEFLATED
            zinfo.create_system = 3
            zinfo.external_attr = 0o644 << 16

            if is_stored:
                current_pos = zf.fp.tell()
                header_len = 30 + len(name.encode("utf-8"))
                data_start = current_pos + header_len
                pad = (4 - (data_start % 4)) % 4
                if pad > 0:
                    zinfo.extra = b"\x00" * pad

            zf.writestr(zinfo, data)


def inject_apk_v2_signature(apk_path, key_path, der_cert_path):
    """
    Compute and inject the Android APK Signature Scheme v2 Block ('APK Sig Block 42', ID 0x7109871a)
    right before the ZIP Central Directory, required for Android 11+ (targetSdkVersion >= 30) and Cafe Bazaar.
    """
    with open(apk_path, "rb") as f:
        apk_bytes = f.read()

    # Locate End of Central Directory (EOCD: 0x06054b50)
    eocd_offset = apk_bytes.rfind(b"PK\x05\x06")
    if eocd_offset < 0:
        return

    cd_size = struct.unpack("<I", apk_bytes[eocd_offset + 12 : eocd_offset + 16])[0]
    cd_offset = struct.unpack("<I", apk_bytes[eocd_offset + 16 : eocd_offset + 20])[0]

    before_cd = apk_bytes[:cd_offset]
    cd_bytes = apk_bytes[cd_offset:eocd_offset]
    eocd_bytes = bytearray(apk_bytes[eocd_offset:])

    def chunk_digests(section_bytes):
        chunks = []
        chunk_size = 1024 * 1024
        for i in range(0, len(section_bytes), chunk_size):
            chunk = section_bytes[i : i + chunk_size]
            hdr = b"\xa5" + struct.pack("<I", len(chunk))
            chunks.append(hashlib.sha256(hdr + chunk).digest())
        if not chunks:
            hdr = b"\xa5" + struct.pack("<I", 0)
            chunks.append(hashlib.sha256(hdr).digest())
        return chunks

    all_chunk_digests = (
        chunk_digests(before_cd)
        + chunk_digests(cd_bytes)
        + chunk_digests(bytes(eocd_bytes[:16]) + struct.pack("<I", cd_offset) + bytes(eocd_bytes[20:]))
    )

    top_level_input = (
        b"\x5a"
        + struct.pack("<I", len(all_chunk_digests))
        + b"".join(all_chunk_digests)
    )
    content_digest = hashlib.sha256(top_level_input).digest()

    def lp_bytes(b):
        return struct.pack("<I", len(b)) + b

    # Algorithm 0x0103 = SIGNATURE_RSA_PKCS1_V1_5_WITH_SHA256
    alg_id = 0x0103
    digest_entry = lp_bytes(struct.pack("<I", alg_id) + lp_bytes(content_digest))
    digests_seq = lp_bytes(digest_entry)

    with open(der_cert_path, "rb") as f:
        cert_der = f.read()

    certs_seq = lp_bytes(lp_bytes(cert_der))
    additional_attrs = lp_bytes(b"")

    signed_data = digests_seq + certs_seq + additional_attrs

    sd_tmp = "/tmp/karbama_v2_signed_data.bin"
    sig_tmp = "/tmp/karbama_v2_sig.bin"
    with open(sd_tmp, "wb") as f:
        f.write(signed_data)

    subprocess.run(
        ["openssl", "dgst", "-sha256", "-sign", key_path, "-out", sig_tmp, sd_tmp],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    with open(sig_tmp, "rb") as f:
        sig_bytes = f.read()

    # extract SubjectPublicKeyInfo (DER) from certificate
    pubkey_der = subprocess.check_output(
        ["openssl", "x509", "-in", der_cert_path, "-inform", "DER", "-pubkey", "-noout"]
    )
    pub_tmp = "/tmp/karbama_pub.pem"
    pub_der_tmp = "/tmp/karbama_pub.der"
    with open(pub_tmp, "wb") as f:
        f.write(pubkey_der)
    subprocess.run(
        ["openssl", "pkey", "-pubin", "-in", pub_tmp, "-outform", "DER", "-out", pub_der_tmp],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    with open(pub_der_tmp, "rb") as f:
        spki_bytes = f.read()

    signature_entry = lp_bytes(struct.pack("<I", alg_id) + lp_bytes(sig_bytes))
    signatures_seq = lp_bytes(signature_entry)

    signer_block = lp_bytes(lp_bytes(signed_data) + signatures_seq + lp_bytes(spki_bytes))
    signers_seq = lp_bytes(signer_block)

    # ID-value pair: ID = 0x7109871a (APK Signature Scheme v2 Block ID)
    pair_payload = struct.pack("<I", 0x7109871A) + signers_seq
    id_value_pair = struct.pack("<Q", len(pair_payload)) + pair_payload

    # Pad block so total APK Signing Block is a multiple of 4096 bytes if needed, or 8-byte aligned
    # Block layout: [uint64 size_of_block_excluding_first_8_bytes] + [pairs] + [uint64 size_of_block] + [16B magic]
    block_size_field = len(id_value_pair) + 8 + 16
    sig_block = (
        struct.pack("<Q", block_size_field)
        + id_value_pair
        + struct.pack("<Q", block_size_field)
        + b"APK Sig Block 42"
    )

    new_cd_offset = cd_offset + len(sig_block)
    eocd_bytes[16:20] = struct.pack("<I", new_cd_offset)

    with open(apk_path, "wb") as f:
        f.write(before_cd + sig_block + cd_bytes + bytes(eocd_bytes))


def build_bundle_config_pb():
    """
    Build a minimal valid protobuf BundleConfig.pb for Android App Bundle (.aab).
    version: "1.15.6"
    """
    version_str = b"1.15.6"
    # field 1 (bundletool): message { field 1 (version): string "1.15.6" }
    inner = b"\x0a" + bytes([len(version_str)]) + version_str
    return b"\x0a" + bytes([len(inner)]) + inner


def build_standalone_apk_and_aab(version=None, version_code=None, package_name="app.karbama.twa", app_name="کارباما"):
    if not version:
        version = get_package_version()

    if not version_code:
        parts = version.split(".")
        try:
            version_code = int(parts[0]) * 10000 + int(parts[-1])
        except Exception:
            version_code = 100019

    print(
        f"Building Cafe Bazaar & Android Compliant APK + AAB: Version={version}, Code={version_code}, Package={package_name}"
    )

    os.makedirs("public", exist_ok=True)
    os.makedirs("public/downloads", exist_ok=True)

    # Clean old versioned APKs and AABs
    for folder in ["public", "public/downloads"]:
        if os.path.exists(folder):
            for f in os.listdir(folder):
                if (f.endswith(".apk") or f.endswith(".aab")) and "v10.0.0." in f and version not in f:
                    try:
                        os.remove(os.path.join(folder, f))
                    except Exception:
                        pass

    build_dir = "/tmp/karbama-apk-build"
    if os.path.exists(build_dir):
        shutil.rmtree(build_dir)
    os.makedirs(build_dir, exist_ok=True)

    key_path, crt_path, der_path = ensure_signing_certificate()

    # 1. Build binary AndroidManifest.xml (AXML), resources.arsc, and classes.dex
    axml_bytes = build_axml_manifest(package_name, version_code, version, app_name)
    arsc_bytes = build_minimal_resources_arsc(package_name, app_name)
    dex_bytes = build_valid_dex(package_name)

    apk_entries = {
        "AndroidManifest.xml": axml_bytes,
        "resources.arsc": arsc_bytes,
        "classes.dex": dex_bytes,
    }
    web_asset_entries = {}

    if os.path.exists("public/logo.png"):
        with open("public/logo.png", "rb") as f:
            logo_bytes = f.read()
        apk_entries["res/mipmap-mdpi-v4/ic_launcher.png"] = logo_bytes
        apk_entries["res/mipmap-hdpi-v4/ic_launcher.png"] = logo_bytes
        apk_entries["res/mipmap-xhdpi-v4/ic_launcher.png"] = logo_bytes
        apk_entries["res/mipmap-xxhdpi-v4/ic_launcher.png"] = logo_bytes
        apk_entries["res/mipmap-xxxhdpi-v4/ic_launcher.png"] = logo_bytes
        apk_entries["res/drawable/ic_launcher.png"] = logo_bytes
        apk_entries["res/drawable-hdpi-v4/ic_launcher.png"] = logo_bytes
        apk_entries["assets/www/logo.png"] = logo_bytes
        apk_entries["assets/www/pwa-192x192.png"] = logo_bytes
        web_asset_entries["base/assets/www/logo.png"] = logo_bytes
        web_asset_entries["base/assets/www/pwa-192x192.png"] = logo_bytes

    # Add Web App Assets (excluding nested packages, downloads folder, or temporary screenshots)
    if os.path.exists("dist"):
        for root, _, files in os.walk("dist"):
            rel_root = os.path.relpath(root, "dist")
            if rel_root.startswith("downloads") or rel_root.startswith("assets/aistudio"):
                continue
            for file in files:
                if (
                    file.endswith(".apk")
                    or file.endswith(".aab")
                    or file.endswith(".zip")
                ):
                    continue
                full_p = os.path.join(root, file)
                rel_p = os.path.relpath(full_p, "dist")
                with open(full_p, "rb") as f:
                    data = f.read()
                apk_entries[f"assets/www/{rel_p}"] = data
                web_asset_entries[f"base/assets/www/{rel_p}"] = data

        # Build a self-contained index.html for Android WebView (file:///android_asset/www/index.html)
        index_html_path = os.path.join("dist", "index.html")
        if os.path.exists(index_html_path):
            with open(index_html_path, "r", encoding="utf-8") as f:
                html_str = f.read()

            # Collect CSS and JS bundles from dist/assets
            css_chunks = []
            js_chunks = []
            assets_dir = os.path.join("dist", "assets")
            if os.path.exists(assets_dir):
                for fname in sorted(os.listdir(assets_dir)):
                    fpath = os.path.join(assets_dir, fname)
                    if not os.path.isfile(fpath):
                        continue
                    if fname.endswith(".css"):
                        with open(fpath, "r", encoding="utf-8") as cf:
                            css_chunks.append(cf.read())
                    elif fname.endswith(".js"):
                        with open(fpath, "r", encoding="utf-8") as jf:
                            js_code = jf.read()
                            # Escape closing script tags safely for inline embedding
                            js_code = js_code.replace("</script", "<\\/script")
                            js_chunks.append(js_code)

            # Prepare optimized base64 logo for in-app rendering
            logo_b64 = ""
            icon_file = "public/pwa-192x192.png" if os.path.exists("public/pwa-192x192.png") else "public/logo.png"
            if os.path.exists(icon_file):
                with open(icon_file, "rb") as lf:
                    logo_b64 = "data:image/png;base64," + base64.b64encode(lf.read()).decode("ascii")

            if logo_b64:
                # 1. Replace in JS chunks (covering double quotes, single quotes, and backtick template literals)
                js_chunks = [
                    j.replace('"/logo.png"', f'"{logo_b64}"')
                     .replace("'/logo.png'", f"'{logo_b64}'")
                     .replace('`/logo.png`', f'`{logo_b64}`')
                     .replace('"/pwa-192x192.png"', f'"{logo_b64}"')
                     .replace("'/pwa-192x192.png'", f"'{logo_b64}'")
                     .replace('`/pwa-192x192.png`', f'`{logo_b64}`')
                    for j in js_chunks
                ]
                html_str = html_str.replace('href="/logo.png"', f'href="{logo_b64}"')
                html_str = html_str.replace('src="/logo.png"', f'src="{logo_b64}"')
                html_str = html_str.replace('content="/logo.png"', f'content="{logo_b64}"')

            # 2. Inject <base href="./"> and global Image prototype interceptor into head
            image_interceptor_script = f"""
<base href="./">
<script>
(function() {{
  var b64 = "{logo_b64}";
  if (!b64) return;
  window.__KARBAMA_LOGO__ = b64;
  if (typeof Object.defineProperty === 'function' && typeof HTMLImageElement !== 'undefined') {{
    try {{
      var proto = HTMLImageElement.prototype;
      var origSet = Object.getOwnPropertyDescriptor(proto, 'src');
      if (origSet && origSet.set) {{
        Object.defineProperty(proto, 'src', {{
          set: function(val) {{
            if (typeof val === 'string' && (val === '/logo.png' || val === './logo.png' || val === 'logo.png' || val.indexOf('logo.png') !== -1 || val.indexOf('pwa-192x192.png') !== -1)) {{
              return origSet.set.call(this, b64);
            }}
            return origSet.set.call(this, val);
          }},
          get: function() {{
            return origSet.get ? origSet.get.call(this) : b64;
          }}
        }});
      }}
    }} catch (e) {{}}
  }}
}})();
</script>
"""
            if "<head>" in html_str:
                html_str = html_str.replace("<head>", "<head>" + image_interceptor_script, 1)

            import re
            # Remove external module script & stylesheet tags that point to /assets/
            html_str = re.sub(r'<script[^>]+src=["\']/assets/[^"\']+["\'][^>]*>\s*</script>', '', html_str)
            html_str = re.sub(r'<link[^>]+href=["\']/assets/[^"\']+\.css["\'][^>]*/?>', '', html_str)

            if css_chunks:
                inline_css = "<style>\n" + "\n".join(css_chunks) + "\n</style>\n"
                html_str = html_str.replace("</head>", inline_css + "</head>", 1)

            if js_chunks:
                inline_js = '<script type="module">\n' + "\n".join(js_chunks) + "\n</script>\n"
                html_str = html_str.replace("</body>", inline_js + "</body>", 1)

            standalone_html_bytes = html_str.encode("utf-8")
            apk_entries["assets/www/index.html"] = standalone_html_bytes
            web_asset_entries["base/assets/www/index.html"] = standalone_html_bytes

    # 2. Generate V1 JAR Signature for APK
    mf_bytes, sf_bytes, rsa_bytes = generate_jar_signature_files(apk_entries, key_path, crt_path)
    apk_entries["META-INF/MANIFEST.MF"] = mf_bytes
    apk_entries["META-INF/CERT.SF"] = sf_bytes
    apk_entries["META-INF/CERT.RSA"] = rsa_bytes

    apk_path = os.path.join(build_dir, f"karbama-v{version}.apk")
    write_zipaligned_zip(apk_path, apk_entries)

    # 3. Inject APK Signature Scheme v2 Block
    inject_apk_v2_signature(apk_path, key_path, der_path)

    # 4. Build Android App Bundle (.aab) for Cafe Bazaar / Google Play
    aab_entries = {
        "BundleConfig.pb": build_bundle_config_pb(),
        "base/manifest/AndroidManifest.xml": axml_bytes,
        "base/dex/classes.dex": dex_bytes,
        "base/resources.pb": arsc_bytes,
    }
    if os.path.exists("public/logo.png"):
        aab_entries["base/res/mipmap-hdpi-v4/ic_launcher.png"] = logo_bytes
        aab_entries["base/res/mipmap-xxhdpi-v4/ic_launcher.png"] = logo_bytes
    aab_entries.update(web_asset_entries)

    aab_mf, aab_sf, aab_rsa = generate_jar_signature_files(aab_entries, key_path, crt_path)
    aab_entries["META-INF/MANIFEST.MF"] = aab_mf
    aab_entries["META-INF/CERT.SF"] = aab_sf
    aab_entries["META-INF/CERT.RSA"] = aab_rsa

    aab_path = os.path.join(build_dir, f"karbama-v{version}.aab")
    write_zipaligned_zip(aab_path, aab_entries, uncompressed_names=set())

    # Copy APK & AAB to target locations
    apk_targets = [
        "karbama-latest.apk",
        f"karbama-v{version}.apk",
        os.path.join("public", f"karbama-v{version}.apk"),
        os.path.join("public/downloads", f"karbama-v{version}.apk"),
        os.path.join("public", "karbama-latest.apk"),
        os.path.join("public/downloads", "karbama-latest.apk"),
    ]
    aab_targets = [
        "karbama-latest.aab",
        f"karbama-v{version}.aab",
        os.path.join("public", f"karbama-v{version}.aab"),
        os.path.join("public/downloads", f"karbama-v{version}.aab"),
        os.path.join("public", "karbama-latest.aab"),
        os.path.join("public/downloads", "karbama-latest.aab"),
    ]

    if os.path.exists("dist"):
        os.makedirs("dist/downloads", exist_ok=True)
        apk_targets.extend([
            os.path.join("dist", f"karbama-v{version}.apk"),
            os.path.join("dist/downloads", f"karbama-v{version}.apk"),
            os.path.join("dist", "karbama-latest.apk"),
            os.path.join("dist/downloads", "karbama-latest.apk"),
        ])
        aab_targets.extend([
            os.path.join("dist", f"karbama-v{version}.aab"),
            os.path.join("dist/downloads", f"karbama-v{version}.aab"),
            os.path.join("dist", "karbama-latest.aab"),
            os.path.join("dist/downloads", "karbama-latest.aab"),
        ])

    for t in apk_targets:
        shutil.copyfile(apk_path, t)
    for t in aab_targets:
        shutil.copyfile(aab_path, t)

    apk_mb = os.path.getsize(apk_targets[0]) / (1024 * 1024)
    aab_mb = os.path.getsize(aab_targets[0]) / (1024 * 1024)
    print(
        f"✅ Signed Karbama APK v{version} ({apk_mb:.2f} MB) & AAB v{version} ({aab_mb:.2f} MB) [Code={version_code}] built!"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--version", default=None)
    parser.add_argument("--version-code", type=int, default=None)
    parser.add_argument("--package-name", default="app.karbama.twa")
    args = parser.parse_args()

    build_standalone_apk_and_aab(
        version=args.version,
        version_code=args.version_code,
        package_name=args.package_name,
    )
