import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Alerta } from './../../shared/models/alerta';
import { AlertaComponent } from "./../../shared/components/alerta/alerta.component";
import { FilmesService } from "./../../core/filmes.service";
import { Filme } from "./../../shared/models/filme";
import { ValidarCamposService } from "./../../shared/components/campos/validar-campos.service";

@Component({
  selector: "dio-cadastro-filmes",
  templateUrl: "./cadastro-filmes.component.html",
  styleUrls: ["./cadastro-filmes.component.scss"],
})
export class CadastroFilmesComponent implements OnInit {
  cadastro: FormGroup;
  generos: Array<string>;
  id: number;

  constructor(
    public validacao: ValidarCamposService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private filmeService: FilmesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  get f() {
    return this.cadastro.controls;
  }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];

    if(this.id) {
      this.filmeService.visualizar(this.id).subscribe((filme: Filme) => {
        this.criarFormulario(filme);
      });
    } else {
      this.criarFormulario(this.criarFilmeEmBranco());
    }

    this.generos = [
      "Ação",
      "Aventura",
      "Ficção Científica",
      "Romance",
      "Terror",
      "Drama",
      "Comédia",
    ];
  }

  submit(): void {
    this.cadastro.markAllAsTouched();
    if (this.cadastro.invalid) {
      return;
    }

    // alert("SUCESSO\n\n" + JSON.stringify(this.cadastro.value, null, 4));
    const filme = this.cadastro.getRawValue() as Filme;
    this.salvar(filme);
  }

  reiniciarForm(): void {
    this.cadastro.reset();
  }

  private criarFormulario(filme: Filme): void {
    this.cadastro = this.fb.group({
      titulo: [
        filme.titulo,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(256),
        ],
      ],
      urlFoto: [filme.urlFoto, [Validators.minLength(10)]],
      dtLancamento: [filme.dtLancamento, [Validators.required]],
      descricao: [filme.descricao],
      nota: [filme.nota, [Validators.required, Validators.min(0), Validators.max(10)]],
      urlIMBd: [filme.urlIMDb, [Validators.minLength(10)]],
      genero: [filme.genero, [Validators.required]],
    });
  }

  private criarFilmeEmBranco(): Filme {
    return {
      id: null,
      titulo: null,
      urlFoto: null,
      dtLancamento: null,
      descricao: null,
      nota: null,
      urlIMBd: null,
      genero: null,
    } as Filme;
  }

  private salvar(filme: Filme): void {
    this.filmeService.salvar(filme).subscribe(
      () => {
        const config = {
          data: {
            btnSucesso: 'Ver lista',
            btnCancelar: 'Cadastrar novo',
            corBtnCancelar: 'primary',
            possuiBtnFechar: true
          } as Alerta
        };
        const dialogRef = this.dialog.open(AlertaComponent, config);
        dialogRef.afterClosed().subscribe((opcao: boolean) => {
          if(opcao) {
            this.router.navigateByUrl('filmes');
          } else {
            this.reiniciarForm();
          }
        });
      },
      () => {
        const config = {
          data: {
            titulo: 'Erro ao salvar o registro!',
            descricao: 'Não conseguimos salvar seu registro, tente novamente mais tarde.',
            corBtnSucesso: 'warn',
            btnSucesso: 'Fechar',
          } as Alerta
        };
        this.dialog.open(AlertaComponent, config);
      }
    );
  }

}
