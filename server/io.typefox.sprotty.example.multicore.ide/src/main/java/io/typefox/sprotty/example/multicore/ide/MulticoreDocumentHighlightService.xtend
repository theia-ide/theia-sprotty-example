package io.typefox.sprotty.example.multicore.ide

import com.google.inject.Inject
import io.typefox.sprotty.example.multicore.ide.diagram.DiagramService
import org.eclipse.xtext.ide.server.occurrences.DefaultDocumentHighlightService
import org.eclipse.xtext.resource.XtextResource
import org.eclipse.xtext.util.CancelIndicator

class MulticoreDocumentHighlightService extends DefaultDocumentHighlightService {
	
	@Inject extension DiagramService diagramService
	 
	override getDocumentHighlights(XtextResource resource, int offset) {
		val highlights = super.getDocumentHighlights(resource, offset)
		resource.setSelection(offset, CancelIndicator.NullImpl)
		return highlights
	}
	
}