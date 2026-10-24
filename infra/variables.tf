variable "neon_org_id" { default = "org-purple-glade-44197785" }                      # la organización de Neon donde se crea el proyecto
variable "image_repo_api" { default = "ghcr.io/agostina19/ingsoft3-tp01-backend" }    # SIN la etiqueta
variable "image_repo_front" { default = "ghcr.io/agostina19/ingsoft3-tp01-frontend" } # SIN la etiqueta
variable "image_tag" { default = "sha-66e17b47485410af3d118c8d468659f89c143f57" }     # la imagen de v7.0.0
variable "region" { default = "ohio" }                                                # frankfurt | ohio | oregon | singapore | virginia
