# We mock GraphQL responses from the API gateway here because they are so large .

mock_project_list_az = {
  "data": {
    "repositories": {
      "edges": [
        {
          "node": {
            "id": "UHJvamVjdDpkZW1vLXVzZXImdGVzdC1wdWJsaXNoLW1heS00",
            "namespace": "demo-user",
            "repositoryName": "test-publish-may-4",
            "description": "my test project",
            "visibility": "public",
            "createdOnUtc": "2019-06-05T01:06:06.760185Z",
            "modifiedOnUtc": "2019-09-12T15:35:11.664Z"
          },
          "cursor": "MTow"
        },
        {
          "node": {
            "id": "UHJvamVjdDpkZW1vLXVzZXImdGVzdC1wdWJsaWMtcHJvamVjdA==",
            "namespace": "demo-user",
            "repositoryName": "test-public-project",
            "description": "Testing public project visibility.",
            "visibility": "public",
            "createdOnUtc": "2019-07-22T11:06:37.435584Z",
            "modifiedOnUtc": "2019-09-12T15:17:23.414Z"
          },
          "cursor": "MTox"
        }
      ],
      "pageInfo": {
        "hasNextPage": True,
        "hasPreviousPage": False,
        "startCursor": "MTow",
        "endCursor": "MTox"
      }
    }
  }
}


mock_project_list_za = {
  "data": {
    "repositories": {
      "edges": [
        {
          "node": {},
          "cursor": "MTow"
        },
        {
          "node": {
            "id": "UHJvamVjdDpkZW1vLXVzZXImZm9ya21l",
            "namespace": "demo-user",
            "repositoryName": "zz-project",
            "description": "another project",
            "visibility": "public",
            "createdOnUtc": "2019-08-28T15:09:22.506423Z",
            "modifiedOnUtc": "2019-08-28T15:09:37.449Z"
          },
          "cursor": "MTox"
        }
      ],
      "pageInfo": {
        "hasNextPage": True,
        "hasPreviousPage": False,
        "startCursor": "MTow",
        "endCursor": "MTox"
      }
    }
  }
}


mock_project_list_az_end = {
  "data": {
    "repositories": {
      "edges": [],
      "pageInfo": {
        "hasNextPage": False,
        "hasPreviousPage": False,
        "startCursor": None,
        "endCursor": None
      }
    }
  }
}

mock_project_list_modified_desc = {
  "data": {
    "repositories": {
      "edges": [
        {
          "node": {
            "id": "UHJvamVjdDpkZW1vLXVzZXImZ2Zoamdoag==",
            "namespace": "demo-user",
            "repositoryName": "gfhjghj",
            "description": "gdhjgfhj",
            "visibility": "private",
            "createdOnUtc": "2019-09-26T20:17:17.134888Z",
            "modifiedOnUtc": "2019-09-26T20:17:39.054Z"
          },
          "cursor": "MTow"
        },
        {
          "node": {
            "id": "UHJvamVjdDpkZW1vLXVzZXImcHJpdmF0ZS1wcm9qZWN0",
            "namespace": "demo-user",
            "repositoryName": "private-project",
            "description": "My description",
            "visibility": "private",
            "createdOnUtc": "2019-09-10T19:43:24.086835Z",
            "modifiedOnUtc": "2019-09-21T01:05:55.758Z"
          },
          "cursor": "MTox"
        }
      ],
      "pageInfo": {
        "hasNextPage": True,
        "hasPreviousPage": False,
        "startCursor": "MTow",
        "endCursor": "MTox"
      }
    }
  }
}

mock_project_list_modified_asc = {
  "data": {
    "repositories": {
      "edges": [
        {
          "node": {
            "id": "UHJvamVjdDpkbWsmdGVzdGluZy1kcy1zeW5j",
            "namespace": "dmk",
            "repositoryName": "testing-ds-sync",
            "description": "sdfgsdfg",
            "visibility": "private",
            "createdOnUtc": "2019-02-28T01:51:33.471998Z",
            "modifiedOnUtc": "2019-02-28T01:54:02.369Z"
          },
          "cursor": "MTow"
        },
        {
          "node": {
            "id": "UHJvamVjdDpkZW1vLXVzZXImdGVzdC1hY3Rpdml0eQ==",
            "namespace": "demo-user",
            "repositoryName": "test-activity",
            "description": "sdfasdfasdfsadf",
            "visibility": "private",
            "createdOnUtc": "2019-03-02T15:25:09.664239Z",
            "modifiedOnUtc": "2019-03-04T15:00:32.280Z"
          },
          "cursor": "MTox"
        },
        {
          "node": {},
          "cursor": "MToy"
        },
        {
          "node": {
            "id": "UHJvamVjdDpkZW1vLXVzZXImdGVzdC1saW5r",
            "namespace": "demo-user",
            "repositoryName": "test-link",
            "description": "asdfasdf",
            "visibility": "private",
            "createdOnUtc": "2019-03-05T04:17:31.618460Z",
            "modifiedOnUtc": "2019-03-05T04:19:05.973Z"
          },
          "cursor": "MToz"
        },
        {
          "node": {},
          "cursor": "MTo0"
        },
        {
          "node": {
            "id": "UHJvamVjdDpkZW1vLXVzZXImbXktbmV3LXByb2plY3QtdGhpbmc=",
            "namespace": "demo-user",
            "repositoryName": "my-new-project-thing",
            "description": "This is a demo project",
            "visibility": "private",
            "createdOnUtc": "2019-03-05T17:43:12.025266Z",
            "modifiedOnUtc": "2019-03-05T18:41:30.188Z"
          },
          "cursor": "MTo1"
        },
        {
          "node": {
            "id": "UHJvamVjdDpkZW1vLXVzZXImZm9ya21l",
            "namespace": "demo-user",
            "repositoryName": "aproj",
            "description": "ggjkdhjfh",
            "visibility": "public",
            "createdOnUtc": "2019-08-28T15:09:22.506423Z",
            "modifiedOnUtc": "2019-08-28T15:09:37.449Z"
          },
          "cursor": "MTo2"
        },
        {
          "node": {},
          "cursor": "MTo3"
        },
        {
          "node": {},
          "cursor": "MTo4"
        }
      ],
      "pageInfo": {
        "hasNextPage": False,
        "hasPreviousPage": False,
        "startCursor": "MTow",
        "endCursor": "MTo4"
      }
    }
  }
}

mock_project_list_page_1 = {
  "data": {
    "repositories": {
      "edges": [
        {
          "node": {
            "id": "UHJvamVjdDpkZW1vLXVzZXImdGVzdC1wdWJsaXNoLW1heS00",
            "namespace": "demo-user",
            "repositoryName": "test-publish-may-4",
            "description": "",
            "visibility": "public",
            "createdOnUtc": "2019-06-05T01:06:06.760185Z",
            "modifiedOnUtc": "2019-09-12T15:35:11.664Z"
          },
          "cursor": "MTow"
        }
      ],
      "pageInfo": {
        "hasNextPage": True,
        "hasPreviousPage": False,
        "startCursor": "MTow",
        "endCursor": "MTow"
      }
    }
  }
}

mock_project_list_page_2 = {
  "data": {
    "repositories": {
      "edges": [
        {
          "node": {
            "id": "UHJvamVjdDpkbWsmdGVzdGluZy1kcy1zeW5j",
            "namespace": "dmk",
            "repositoryName": "testing-ds-sync",
            "description": "sdfgsdfg",
            "visibility": "private",
            "createdOnUtc": "2019-02-28T01:51:33.471998Z",
            "modifiedOnUtc": "2019-02-28T01:54:02.369Z"
          },
          "cursor": "Mjow"
        },
        {
          "node": {},
          "cursor": "Mjox"
        },
        {
          "node": {},
          "cursor": "Mjoy"
        },
        {
          "node": {
            "id": "UHJvamVjdDpkZW1vLXVzZXImdGVzdC1hY3Rpdml0eQ==",
            "namespace": "demo-user",
            "repositoryName": "test-activity",
            "description": "sdfasdfasdfsadf",
            "visibility": "private",
            "createdOnUtc": "2019-03-02T15:25:09.664239Z",
            "modifiedOnUtc": "2019-03-04T15:00:32.280Z"
          },
          "cursor": "Mjoz"
        }
      ],
      "pageInfo": {
        "hasNextPage": False,
        "hasPreviousPage": False,
        "startCursor": "Mjow",
        "endCursor": "Mjoz"
      }
    }
  }
}