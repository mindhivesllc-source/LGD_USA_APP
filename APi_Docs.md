lgdusallc.com : API DOCUMENTATION

Jewelry API Overview

The Jewelry API provides access to various types of jewelry items available in the inventory. Developers can use this API to retrieve jewelry data for their applications, e-commerce platforms, or custom jewelry tools.

Base URL: https://lgdusallc.com/developer-api
Authentication
To access the API, include the key parameter in your requests. Replace YOUR_API_KEY with your actual API key.
Endpoint
All Jewelry

Endpoint: /jewelry?type=all&page=1&key=YOUR_API_KEY

Description: Retrieves information about all types of jewelry items.

Parameters:

type: Specify all.

page: Page number (e.g., 1, 2, …).

key: Your API key.

Response Format
The API responds with jewelry data in JSON format.


Example Response

{
    "page_no": "1",
    "total_page": 1,
    "per_page": 3000,
    "total_results": "1104",
    "data": [
        {
            "Stock_No": "LGD12RMH",
            "Subitem": "12RMH",
            "Category": "RINGS",
            "Jewelry_Type": "FANCY",
            "Metal_Type": "14KY",
            "Casting_Wt": "0",
            "Shape": "ROUND",
            "Color": "EF",
            "Clarity": "SI1",
            "Dia_Pcs": "38",
            "Dia_Wt": "2.95",
            "Growth_Type": "HPHT",
            "Size": "7",
            "Certificate": "",
            "Inhand_Pcs": "1",
            "Memo_Out": "0",
            "Price": "907.6",
            "Remarks": "FANCY RING 14KY EF SI1 HPHT DIA 2.95CTS",
            "Image_1": "",
            "Image_2": "",
            "Video_1": ""
        },
        ...
    ]
}


GET Jewelry

https://lgdusallc.com/developer-api/jewelry?type=all&page=1&key=

PARAMS 

type all

page 1

key 