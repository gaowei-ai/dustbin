import * as vscode from "vscode";

import { FileExplorerProvider } from "../treeViewDataProvider";

export function refesh(provider: FileExplorerProvider) {
	return vscode.commands.registerCommand("dustbin.refesh", async () => {
		provider.refresh();
	});
}
