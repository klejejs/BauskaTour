import csv
import json

path = "./data/object_data/"

file_name = path + "mvp.csv"
type_array_lv = []
type_array_en = []
data_dict = {}
icon_dict_lv = {}
icon_dict_en = {}
color_dict_lv = {}
color_dict_en = {}

hierarchy_dict_lv = {}
hierarchy_dict_en = {}
list_of_parents_lv = []
list_of_parents_en = []

with open(file_name, "r", encoding="UTF-8") as f:
    reader = csv.reader(f)
    header = True
    for line in reader:
        if header:
            header = False
            continue
        title = line[0]
        address = line[1]
        if line[2] != "":
            coordinates = [float(s) for s in line[2].split(", ")]
        else:
            coordinates = [0, 0]
        description_lv = line[3]
        description_en = line[4]
        references = line[5]
        object_type_lv = line[6]
        object_type_en = line[7]
        icon = line[8]
        iconColor = line[9]
        parent_lv = line[10]
        parent_en = line[11]
        additional_info_lv = line[12]
        additional_info_en = line[13]
        telephone = line[14]
        working_hours_monday = line[15]
        working_hours_tuesday = line[16]
        working_hours_wednesday = line[17]
        working_hours_thursday = line[18]
        working_hours_friday = line[19]
        working_hours_saturday = line[20]
        working_hours_sunday = line[21]
        photos = line[22]      
        referencesImagesTitles = line[23]
        referencesImages = line[24]
        referencesTitles = line[25]

        if (working_hours_monday == "" and working_hours_tuesday == "" and working_hours_wednesday == "" and working_hours_thursday == "" and working_hours_friday == "" and working_hours_saturday == "" and working_hours_sunday == ""):
            opening_times = ""
        else:
            opening_times = {
                "monday": working_hours_monday,
                "tuesday": working_hours_tuesday,
                "wednesday": working_hours_wednesday,
                "thursday": working_hours_thursday,
                "friday": working_hours_friday,
                "saturday": working_hours_saturday,
                "sunday": working_hours_sunday
            }

        temp_dict = {
            "type_lv": object_type_lv,
            "type_en": object_type_en,
            "icon": icon + ".svg",
            "description_lv": description_lv,
            "description_en": description_en,
            "address": address,
            "coordinates": coordinates,
            "cellphone": telephone,
            "amenities": "",
            "price": "",
            "url": "",
            "additional_info_lv": additional_info_lv,
            "additional_info_en": additional_info_en,
            "references": references,
            "opening_times" : opening_times,
            "photos": photos,
            "referencesImagesTitles": referencesImagesTitles,
            "referencesImages": referencesImages,
            "referencesTitles": referencesTitles
        }
        
        if (object_type_lv not in type_array_lv):
            type_array_lv.append(object_type_lv)
        if (object_type_en not in type_array_en):
            type_array_en.append(object_type_en)

        if (object_type_lv not in icon_dict_lv.keys()):
            icon_dict_lv[object_type_lv] = icon + ".svg"
        if (object_type_en not in icon_dict_en.keys()):
            icon_dict_en[object_type_en] = icon + ".svg"

        if (object_type_lv not in color_dict_lv.keys()):
            color_dict_lv[object_type_lv] = iconColor
        if (object_type_en not in color_dict_en.keys()):
            color_dict_en[object_type_en] = iconColor

        if (parent_lv == ""):
            if (object_type_lv not in hierarchy_dict_lv.keys()):
                hierarchy_dict_lv[object_type_lv] = ""
                list_of_parents_lv.append(object_type_lv)
        else:
            if (parent_lv not in hierarchy_dict_lv.keys()):
                hierarchy_dict_lv[parent_lv] = [object_type_lv]
                list_of_parents_lv.append(parent_lv)
                color_dict_lv[parent_lv] = iconColor
            else:
                if object_type_lv not in hierarchy_dict_lv[parent_lv]:
                    hierarchy_dict_lv[parent_lv].append(object_type_lv)

        if (parent_en == ""):
            if (object_type_en not in hierarchy_dict_en.keys()):
                hierarchy_dict_en[object_type_en] = ""
                list_of_parents_en.append(object_type_en)
        else:
            if (parent_en not in hierarchy_dict_en.keys()):
                hierarchy_dict_en[parent_en] = [object_type_en]
                list_of_parents_en.append(parent_en)
                color_dict_en[parent_en] = iconColor
            else:
                if object_type_en not in hierarchy_dict_en[parent_en]:
                    hierarchy_dict_en[parent_en].append(object_type_en)

        data_dict[title] = temp_dict

type_array = {
    "lv": type_array_lv,
    "en": type_array_en
}

icon_array = {
    "lv": icon_dict_lv,
    "en": icon_dict_en
}

color_array = {
    "lv": color_dict_lv,
    "en": color_dict_en
}

hierarchy_dict = {
    "lv": hierarchy_dict_lv,
    "en": hierarchy_dict_en
}

list_of_parents = {
    "lv": list_of_parents_lv,
    "en": list_of_parents_en
}

type_array = json.dumps(type_array, ensure_ascii=False)
icon_array = json.dumps(icon_array, ensure_ascii=False)
color_array = json.dumps(color_array, ensure_ascii=False)
data_dict = json.dumps(data_dict, ensure_ascii=False)
hierarchy_dict = json.dumps(hierarchy_dict, ensure_ascii=False)
list_of_parents = json.dumps(list_of_parents, ensure_ascii=False)

with open(path + "data.js", "w", encoding="UTF-8") as f:
    f.write("let parentsList = " + list_of_parents + ";\n")
    f.write("let hierarchyDict = " + hierarchy_dict + ";\n")
    f.write("let dataIcons = " + icon_array + ";\n")
    f.write("let dataColor = " + color_array + ";\n")
    f.write("let dataTypes = " + type_array + ";\n")
    f.write("let jsonData = " + data_dict + ";")

print("Done.")
