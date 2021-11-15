import paml

libraries = ['liquid_handling', 'plate_handling', 'spectrophotometry', 'sample_arrays']

for lib in libraries:
    paml.import_library(lib)