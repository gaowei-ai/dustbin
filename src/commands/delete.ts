import * as vscode from "vscode";

import { FileExplorerProvider } from "../treeViewDataProvider";
import fs from "fs";

export function deleteFileOrFolder(provider: FileExplorerProvider) {
	return vscode.commands.registerCommand("dustbin.delete", async (node) => {
		const fsPath = node.resourceUri.fsPath;
		const confirm = await vscode.window.showWarningMessage(
			`你确定要删除 ${fsPath} 吗？`,
			{ modal: true },
			"确定"
		);
		if (confirm === "确定") {
			fs.rmSync(fsPath, { recursive: true });
			provider.refresh(); // 刷新列表
		}
	});
}
