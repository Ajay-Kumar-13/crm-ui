export const users = [
    {
        "id": "cb0e4cdb-9ff6-4f4b-b46d-e1e564870bee",
        "username": "superuser",
        "email": "superuser@gmail.com",
        "role": {
            "id": "4be77037-a438-4755-a470-064f3276506f",
            "name": "ROOT"
        },
        "authorities": [
            {
                "id": "a6b9870b-9c80-4686-9f25-1fe27afe2760",
                "name": "CREATE"
            },
            {
                "id": "e799e0ec-2534-4a93-9df5-33adc1683c5c",
                "name": "READ"
            },
            {
                "id": "0204f424-9a9a-4bfe-ad0b-367445fe7686",
                "name": "UPDATE"
            },
            {
                "id": "3c2bd567-4492-4f07-aa52-08ff30b36723",
                "name": "DELETE"
            }
        ],
        "accountActive": true
    },
    {
        "id": "cb0e8cdb-9ff6-4f4b-b46d-e1e564870bee",
        "username": "test",
        "email": "test@gmail.com",
        "role": {
            "id": "4be77903-a438-4755-a470-064f3276506f",
            "name": "ADMIN"
        },
        "authorities": [
            {
                "id": "a69870b9-9c80-4686-9f25-1fe27afe2760",
                "name": "CREATE"
            },
            {
                "id": "e79e90ec-2534-4a93-9df5-33adc1683c5c",
                "name": "READ"
            },
            {
                "id": "0204f924-9a9a-4bfe-ad0b-367445fe7686",
                "name": "UPDATE"
            },
            {
                "id": "3c2bd967-4492-4f07-aa52-08ff30b36723",
                "name": "DELETE"
            }
        ],
        "accountActive": true
    }
]

export const updatedUser = {
    "id": "2b87d336-9f21-4ffb-8f2e-4b5bb23f5441",
    "username": "superuser",
    "email": "superuser@gmail.com",
    "role": {
        "id": "d18f6149-7eaf-47d7-9681-1dec53576945",
        "name": "ROOT",
        "description": "This role has all permissions and can perform any action in the system."
    },
    "authorities": [
        {
            "id": "d11f6002-cc1d-4076-88e4-7282f5b3c7d8",
            "name": "CREATE",
            "description": "Allows the user to create new records in the system."
        },
        {
            "id": "3e8a8cb4-6d71-4e81-bce5-259b42c4b034",
            "name": "READ",
            "description": "Allows the user to read records in the system."
        },
        {
            "id": "32b34539-6ffc-488c-9944-f7cb94f56825",
            "name": "UPDATE",
            "description": "Allows the user to update records in the system."
        },
        {
            "id": "d42f0e2b-a05a-4c4a-80dc-198c7a21d454",
            "name": "DELETE",
            "description": "Allows the user to delete records in the system."
        }
    ],
    "accountActive": true
}