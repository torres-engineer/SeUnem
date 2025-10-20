#    SeUnem - A free software platform for participatory decision-making and
#    collective event management.
#    Copyright (C) 2025  João Augusto Costa Branco Marado Torres
#    <torres.dev@disroot.org>
#
#    This file is part of SeUnem.
#
#    SeUnem is free software: you can redistribute it and/or modify it under
#    the terms of the GNU Affero General Public License as published by the
#    Free Software Foundation, either version 3 of the License, or (at your
#    option) any later version.
#
#    SeUnem is distributed in the hope that it will be useful, but WITHOUT ANY
#    WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
#    FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for
#    more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with SeUnem.  If not, see <https://www.gnu.org/licenses/>
MAIN=analysis_n_design
LATEXMK=latexmk
BIBER=biber
# PDF2PS=gs -dNOPAUSE -dBATCH -sDEVICE=ps2write -sOutputFile=$(MAIN).ps
PDF2PS=pdf2ps
# PLANTUML=plantuml
PLANTUML=java -jar /opt/plantuml/build/libs/plantuml-pdf-1.2025.10beta1.jar
SHELL:=/bin/sh

LATEXMKFLAGS=-xelatex -shell-escape -interaction=nonstopmode -file-line-error

UMLDIR=uml
UML_PUML=$(wildcard $(UMLDIR)/*.puml)
UML_PDFS=$(UML_PUML:.puml=.pdf)
UML_EPS=$(UML_PUML:.puml=.eps)

.PHONY: all pdf ps clean veryclean watch uml

all: pdf

pdf: uml $(MAIN).pdf

$(MAIN).pdf: $(MAIN).tex bibliography.bib $(UML_PDFS)
	@echo ">>> Building PDF using latexmk (XeLaTeX + biber)..."
	$(LATEXMK) $(LATEXMKFLAGS) $(MAIN).tex
	@echo ">>> PDF ready: $(MAIN).pdf"

ps: $(MAIN).ps

$(MAIN).ps: $(MAIN).pdf
	@echo ">>> Converting PDF to PS ..."
	$(PDF2PS) $(MAIN).pdf $(MAIN).ps
	@echo ">>> PS ready: $(MAIN).ps"

$(UMLDIR)/%.pdf: $(UMLDIR)/%.puml
	@echo ">>> Generating $@ from $<"
	$(PLANTUML) -tpdf $<

$(UMLDIR)/%.eps: $(UMLDIR)/%.puml
	@echo ">>> Generating $@ from $<"
	$(PLANTUML) -teps $<

watch:
	@echo ">>> Watching source for changes (Ctrl+C to stop)..."
	$(LATEXMK) -pvc $(LATEXMKFLAGS) $(MAIN).tex

clean:
	@echo ">>> Cleaning auxiliary files..."
	$(LATEXMK) -c

veryclean: clean
	$(LATEXMK) -C
	rm -f $(UML_PDFS) $(UML_EPS)

