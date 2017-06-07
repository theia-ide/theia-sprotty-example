package io.typefox.sprotty.example.multicore.ide.diagram

import com.google.inject.Inject
import io.typefox.sprotty.api.IDiagramSelectionListener
import io.typefox.sprotty.api.IDiagramServer
import io.typefox.sprotty.api.SModelIndex
import io.typefox.sprotty.api.SelectAction
import io.typefox.sprotty.example.multicore.multicoreAllocation.Program
import io.typefox.sprotty.example.multicore.multicoreAllocation.Step
import io.typefox.sprotty.example.multicore.multicoreAllocation.Task
import io.typefox.sprotty.example.multicore.multicoreAllocation.TaskAllocation
import io.typefox.sprotty.example.multicore.multicoreAllocation.TaskRunning
import org.eclipse.emf.ecore.EObject
import org.eclipse.lsp4j.Location
import org.eclipse.lsp4j.Range
import org.eclipse.xtext.resource.ILocationInFileProvider

import static extension org.eclipse.xtext.EcoreUtil2.*

class MulticoreAllocationSelectionListener implements IDiagramSelectionListener {
	
	@Inject extension ILocationInFileProvider
	
	override selectionChanged(SelectAction action, IDiagramServer server) {
		val it = server as MulticoreAllocationDiagramServer
		if (diagramLanguageClient !== null && model !== null) {
			if (action.selectedElementsIDs?.size == 1 && !action.deselectAll) { 
				val location = getLocationInTextEditor(action.selectedElementsIDs.head)
				if (location !== null) 
					diagramLanguageClient.openInTextEditor(location)
			}
		}
	}
	
	protected def Location getLocationInTextEditor(MulticoreAllocationDiagramServer it, String elementID) {
		val sElement = SModelIndex.find(model, elementID)
		if (sElement !== null) {
			val element = modelMapping.inverse.get(sElement)
			if (element !== null) {
				val nameRegion = getElementToSelectInText(element).significantTextRegion
				return languageServerAccess.doRead(resourceId) [ context |
					val start = context.document.getPosition(nameRegion.offset)
					val end = context.document.getPosition(nameRegion.offset + nameRegion.length)
					new Location(resourceId, new Range(start, end))
				].get
			}
		}
	}
	
	protected def getElementToSelectInText(MulticoreAllocationDiagramServer server, EObject selectionInDiagram) {
		switch selectionInDiagram {
			Task: {
				val previousSelection = server.selection
				val previousStep = previousSelection.getContainerOfType(Step) 
				if (previousStep !== null) {
					for (allocation: previousStep.allocations) {
						if (allocation.task === selectionInDiagram)
							return allocation
					}
				}
				val program = selectionInDiagram.getContainerOfType(Program)
				if (program !== null) {
					for (allocation: program.eAllOfType(TaskAllocation)) {
						if (allocation.task === selectionInDiagram)
							return allocation
					}
				}
			}
			TaskRunning:
				return selectionInDiagram
		}
		val previousStep = selectionInDiagram.getContainerOfType(Step) 
		return previousStep	?: selectionInDiagram
	}
	
}