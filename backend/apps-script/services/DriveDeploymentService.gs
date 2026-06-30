function initializeOperationalIntelligenceDrive(rootFolderName, parentFolderId) {
  var rootName = rootFolderName || "Operational Intelligence Platform";
  var parentFolder = getDeploymentParentFolder_(parentFolderId);
  var rootFolder = findOrCreateDeploymentFolder_(parentFolder, rootName);
  var structure = getOperationalIntelligenceDriveStructure_();

  createDeploymentFolderTree_(rootFolder, structure);

  return {
    rootFolderId: rootFolder.getId(),
    rootFolderName: rootFolder.getName(),
    foldersCreatedOrVerified: flattenDeploymentFolderNames_(structure, rootName)
  };
}

function getDeploymentParentFolder_(parentFolderId) {
  if (parentFolderId) {
    return DriveApp.getFolderById(parentFolderId);
  }

  return DriveApp.getRootFolder();
}

function getOperationalIntelligenceDriveStructure_() {
  return [
    {
      name: "00_Admin",
      children: ["01_Configuration", "02_Access-Control", "03_Audit-Logs"]
    },
    {
      name: "01_Projects",
      children: [
        {
          name: "_TEMPLATE_PROJECT",
          children: [
            "01_Input-Documents",
            "02_Normalized-Documents",
            "03_Interviews",
            "04_Notes",
            "05_Evidence",
            "06_Knowledge-Packages",
            "07_Context-Graphs",
            "08_Process-Models",
            "09_VSM",
            "10_Assessments",
            "11_To-Be",
            "12_Business-Case",
            "13_Roadmap",
            "14_Executive-Report",
            "99_Archive"
          ]
        }
      ]
    },
    "02_Prompt-Repository",
    "03_Templates",
    "04_Exports",
    "99_Archive"
  ];
}

function createDeploymentFolderTree_(parentFolder, items) {
  items.forEach(function(item) {
    var descriptor = typeof item === "string" ? { name: item, children: [] } : item;
    var folder = findOrCreateDeploymentFolder_(parentFolder, descriptor.name);

    if (descriptor.children && descriptor.children.length) {
      createDeploymentFolderTree_(folder, descriptor.children);
    }
  });
}

function findOrCreateDeploymentFolder_(parentFolder, name) {
  var existing = parentFolder.getFoldersByName(name);

  if (existing.hasNext()) {
    return existing.next();
  }

  return parentFolder.createFolder(name);
}

function flattenDeploymentFolderNames_(items, prefix) {
  var paths = [];

  items.forEach(function(item) {
    var descriptor = typeof item === "string" ? { name: item, children: [] } : item;
    var path = prefix + "/" + descriptor.name;

    paths.push(path);

    if (descriptor.children && descriptor.children.length) {
      paths = paths.concat(flattenDeploymentFolderNames_(descriptor.children, path));
    }
  });

  return paths;
}
